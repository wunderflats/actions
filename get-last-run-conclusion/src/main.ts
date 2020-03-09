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
    console.log({owner, repo, GITHUB_RUN_ID, jobName})

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
    const filteredJobs = jobs
      .filter(job => job.name === jobName)
      .filter(job => job.status === 'completed')
      // Sort by started_at in descending order. Latest first.
      .sort((jobA, jobB) => {
        const timestampA = new Date(jobA.started_at).getTime()
        const timestampB = new Date(jobB.started_at).getTime()
        if (timestampA > timestampB) {
          return -1
        }

        if (timestampA < timestampB) {
          return 1
        }

        return 0
      })

    console.log({jobs})
    console.log({filteredJobs})

    const matchingJob = filteredJobs[0]
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
