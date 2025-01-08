import * as github from '@actions/github'
import * as core from '@actions/core'

const bent = require('bent')

const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/', 2)
const GITHUB_RUN_ID = Number.parseInt(process.env.GITHUB_RUN_ID!)

const webhookToken = core.getInput('webhook-token')
const commitMessage = core.getInput('commit-message')
const token = core.getInput('github-token')
const failedMessage = core.getInput('failed-message')

const octokit = github.getOctokit(token)

const runLink = `https://github.com/${owner}/${repo}/actions/runs/${GITHUB_RUN_ID}`
const commit =
  commitMessage.trim().length > 0
    ? `\n*${commitMessage.trim().split('\n')[0]}*\n`
    : ''
// console.log({FAILED_MESSAGE})
const deploymentTestFail = {
  text:
    failedMessage ||
    `❌ A check failed for commit ${commit}<${runLink}|See github action>`
}

async function run(): Promise<void> {
  const service = 'https://hooks.slack.com/services/'
  const post = await bent(service, 'POST', 'string', 200)

  try {
    console.log({owner, repo, GITHUB_RUN_ID})

    const jobs = (
      await octokit.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: GITHUB_RUN_ID,
        per_page: 100,
        filter: 'all'
      })
    ).data.jobs
    const filteredJobs = jobs.filter(job => job.status === 'completed')

    const jobStatuses = filteredJobs.reduce(
      (acc: {[key: string]: boolean}, job) => {
        if (acc[job.name] === true) {
          return acc
        }

        acc[job.name] =
          job.conclusion === 'success' || job.conclusion === 'skipped'

        return acc
      },
      {}
    )

    // uncomment for debugging
    // console.log({jobs})
    console.log({jobStatuses})

    const atLeastOneJobFailed = Object.values(jobStatuses).some(
      jobSucceded => jobSucceded === false
    )

    console.log({atLeastOneJobFailed})

    if (atLeastOneJobFailed) {
      await post(webhookToken, deploymentTestFail)
    }
  } catch (error) {
    console.error(error)
    core.setFailed((error as Error).message)
  }
}

run()
