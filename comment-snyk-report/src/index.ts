import * as github from "@actions/github";
import * as core from "@actions/core";
import fs from "node:fs";
import _ from "lodash";
import {
  SnykCodeTestReport,
  SnykCodeTestReportVulnerability,
  SnykTestReport,
} from "./types.js";

const token = core.getInput("GITHUB_TOKEN", { required: true });
const dependenciesCheckFilePath = core.getInput("DEPENDENCIES_CHECK_FILE");
const codebaseCheckFilePath = core.getInput("CODEBASE_CHECK_FILE");

const octokit = github.getOctokit(token);

await run();

async function run() {
  try {
    const commentBody = await getCommentBody();

    await addOrUpdateSnykComment(commentBody);
  } catch (error: unknown) {
    core.setFailed((error as Error).message);
  }
}

async function getCommentBody(): Promise<string> {
  const dependenciesReport = await getDependenciesReport();
  const codebaseReport = await getCodebaseReport();

  const commentBody = `## 🔎 Snyk Scan Report
${dependenciesReport}

---
${codebaseReport}
  `;

  return commentBody;
}

async function getDependenciesReport(): Promise<string> {
  if (!dependenciesCheckFilePath) {
    return "✅ No issue found in the dependencies.";
  }

  const dependenciesJsonReport = await fs.readFileSync(
    dependenciesCheckFilePath,
    "utf8"
  );

  const fullReport: SnykTestReport[] = JSON.parse(dependenciesJsonReport);

  const customizedReport = fullReport.map(
    ({ projectName, ok, vulnerabilities }) => {
      const severityCounts = _.countBy(vulnerabilities, "severity");

      return {
        projectName,
        successfulScan: ok,
        vulnerabilities: {
          criticals: severityCounts["critical"] ?? 0,
          highs: severityCounts["high"] ?? 0,
          mediums: severityCounts["medium"] ?? 0,
          lows: severityCounts["low"] ?? 0,
        },
      };
    }
  );

  const formattedReport = `
  ### List of dependencies-related vulnerabilities

  ${customizedReport
    .map((r) => {
      const successfulScanEmoji = r.successfulScan ? "✅" : "❌";
      const successfulScanMessage = r.successfulScan
        ? "passed with zero vulnerabilities"
        : `failed with ${r.vulnerabilities.criticals} criticals, ${r.vulnerabilities.highs} highs, ${r.vulnerabilities.mediums} mediums and ${r.vulnerabilities.lows} lows vulnerabilities`;

      return `- ${successfulScanEmoji} \`${r.projectName}\` scan ${successfulScanMessage}`;
    })
    .join("\n")}`;

  return formattedReport;
}

async function getCodebaseReport(): Promise<string> {
  if (!codebaseCheckFilePath) {
    return "✅ No issue found in the code.";
  }

  const codebaseJsonReport = await fs.readFileSync(
    codebaseCheckFilePath,
    "utf8"
  );

  const fullReport: SnykCodeTestReport = JSON.parse(codebaseJsonReport);

  const customizedReport = _(fullReport.runs[0].results)
    .filter({ level: "error" })
    .groupBy("ruleId")
    .map((results: SnykCodeTestReportVulnerability[], ruleId: string) => ({
      title: _.get(
        _.find(fullReport.runs[0].tool.driver.rules, { id: ruleId }),
        "shortDescription.text"
      ),
      description: results[0].message.text,
      paths: results.map(
        (result) =>
          `${result.locations[0].physicalLocation.artifactLocation.uri}, line ${result.locations[0].physicalLocation.region.startLine}`
      ),
    }))
    .value();

  const highLevelIssues = customizedReport
    .map(
      (r: any) =>
        `
\n
#### ❌ ${r.title} \n
${r.description} \n
Paths: \n
${r.paths.map((p: string) => `- \`${p}\``).join("\n")}`
    )
    .join("\n");

  const formattedReport = `

  ### List of codebase-related vulnerabilities:

  <details closed>
  <summary>High vulnerabilities</summary>

  ${highLevelIssues}
  </details>`;

  return formattedReport;
}

async function addOrUpdateSnykComment(commentBody: string): Promise<void> {
  const { payload, repo } = github.context;

  const { data: commentsOfPR } = await octokit.rest.issues.listComments({
    issue_number: payload.number,
    owner: repo.owner,
    repo: repo.repo,
  });

  const snykComment = commentsOfPR.find(
    (c: any) => c.user?.login === "github-actions[bot]"
  );

  if (!snykComment) {
    await octokit.rest.issues.createComment({
      issue_number: payload.number,
      owner: repo.owner,
      repo: repo.repo,
      body: commentBody,
    });

    return;
  }

  await octokit.rest.issues.updateComment({
    comment_id: snykComment.id,
    owner: repo.owner,
    repo: repo.repo,
    body: commentBody,
  });
}
