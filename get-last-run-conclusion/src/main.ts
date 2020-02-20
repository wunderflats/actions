import {Octokit} from '@octokit/rest'
import * as github from '@actions/github'
import * as core from '@actions/core'

const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/', 2)
const branch = process.env.GITHUB_HEAD_REF
  ? process.env.GITHUB_HEAD_REF
  : process.env.GITHUB_REF!.replace('refs/heads/', '')

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
const jobName = core.getInput('jobName')

const octokit: Octokit = (new github.GitHub(GITHUB_TOKEN) as any) as Octokit

async function run(): Promise<void> {
  try {
    const actionEvents = await import(process.env.GITHUB_EVENT_PATH!)

    // In case you are wondering, github is not consistent here. On the UI it will give you
    // the commit hash of your branch head, but in reality GITHUB_SHA is the commit hash
    // of your commit on the target branch of your PR. So we parse it from the event file.
    const commitHash = process.env.GITHUB_HEAD_REF
      ? actionEvents.pull_request.head.sha
      : process.env.GITHUB_SHA

    const workflowRuns = (
      await octokit.actions.listRepoWorkflowRuns({
        owner,
        repo,
        branch,
        per_page: 100
      })
    ).data.workflow_runs

    console.log({workflowRuns})

    const matchingWorkflowRun = workflowRuns.find(
      workflowRun => workflowRun.head_sha === commitHash
    )

    console.log({matchingWorkflowRun})

    if (matchingWorkflowRun == null) {
      return core.setOutput('conclusion', 'pending')
    }

    const jobs = (
      await octokit.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: matchingWorkflowRun.id
      })
    ).data.jobs

    console.log({jobs})

    const matchingJob = jobs.find(job => job.name === jobName)

    console.log({matchingJob})

    if (matchingJob == null) {
      return core.setOutput('conclusion', 'pending')
    }

    return core.setOutput('conclusion', matchingJob.conclusion)
  } catch (error) {
    console.error(error)
    core.setFailed(error.message)
  }
}

run()
