import {Octokit} from '@octokit/rest'
import * as github from '@actions/github'
import * as core from '@actions/core'

const bent = require('bent')

const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/', 2)
const GITHUB_RUN_ID = Number.parseInt(process.env.GITHUB_RUN_ID!)

const {
  INPUT_GITHUB_RUN_ID: runId,
  INPUT_WEBHOOK_TOKEN: webhookToken,
  INPUT_COMMIT_MESSAGE: commitMessage
} = process.env

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')

const octokit: Octokit = (new github.GitHub(GITHUB_TOKEN) as any) as Octokit

const runLink = `https://github.com/${owner}/${repo}/actions/runs/${runId}`
const masterActionPage = `https://github.com/${owner}/${repo}/actions?query=branch%3Amaster`
const commit =
  commitMessage!.trim().length > 0
    ? `\n*${commitMessage!.trim().split('\n')[0]}*\n`
    : ''

const deploymentTestFail = {
    text: `❌ A test check failed preventing deployment on master ${commit}<${runLink}|See github action>`
  };


async function run(): Promise<void> {
  const service = 'https://hooks.slack.com/services/'
  const post = await bent(service, "POST", "json", 200);

  try {
    console.log({owner, repo, GITHUB_RUN_ID})

    const jobs = (
      await octokit.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: GITHUB_RUN_ID,
        per_page: 100,
        // API change require this new parameter which is not yet in oktokit
        // see: https://github.blog/changelog/2020-03-09-new-filter-parameter-in-workflow-jobs-api/
        filter: 'all'
      } as any)
    ).data.jobs
    const filteredJobs = jobs.filter(job => job.status === 'completed')

    const jobStatuses = filteredJobs.reduce(
      (acc: {[key: string]: boolean}, job) => {
        if (acc[job.name] === true) {
          return acc
        }

        acc[job.name] = job.conclusion === 'success'

        return acc
      },
      {}
    )

    // uncomment for debugging
    // console.log({jobs})
    console.log({jobStatuses})

    const atLeastOneJobFailed = Object.values(jobStatuses).some(jobSucceded => jobSucceded === false)

    console.log({atLeastOneJobFailed})

    if (atLeastOneJobFailed) {
      await post(webhookToken, deploymentTestFail);
    }

  } catch (error) {
    console.error(error)
    core.setFailed(error.message)
  }
}

run()
