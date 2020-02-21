import {Octokit} from '@octokit/rest'
import * as github from '@actions/github'
import * as core from '@actions/core'

const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/', 2)
const GITHUB_RUN_ID = Number.parseInt(process.env.GITHUB_RUN_ID!)

const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
const jobName = core.getInput('jobName')

const octokit: Octokit = (new github.GitHub(GITHUB_TOKEN) as any) as Octokit

async function run(): Promise<void> {
  try {
    const jobs = (
      await octokit.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: GITHUB_RUN_ID
      })
    ).data.jobs
      .filter(job => job.name === jobName)
      .filter(job => job.status === 'completed')
      // Sort by started_at in descending order. Latest first.
      .sort((jobA, jobB) => Number(jobA.started_at < jobB.started_at))

    console.log({jobs})

    const matchingJob = jobs[0]
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
