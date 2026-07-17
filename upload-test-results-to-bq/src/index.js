import fs from "node:fs";
import { BigQuery } from "@google-cloud/bigquery";
import { XMLParser } from "fast-xml-parser";

const xmlPath = process.env.INPUT_XML_PATH;
const testType = process.env.INPUT_TEST_TYPE;
const projectId = process.env.INPUT_PROJECT;
const dataset = process.env.INPUT_DATASET || "ci_metrics";
const table = process.env.INPUT_TABLE || "test_results";

const repo = process.env.GITHUB_REPOSITORY;
const workflow = process.env.GITHUB_WORKFLOW;
const isDefaultBranch = process.env.GITHUB_REF_NAME === "master";
const commitSha = process.env.GITHUB_SHA;
const runId = process.env.GITHUB_RUN_ID;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ["testsuites", "testsuite", "testcase"].includes(name),
});

function deriveStatus(tc) {
  if (tc.failure !== undefined) return "failed";
  if (tc.error !== undefined) return "error";
  if (tc.skipped !== undefined) return "skipped";
  return "passed";
}

function parseFile(filePath) {
  const parsed = parser.parse(fs.readFileSync(filePath, "utf8"));

  const suites = parsed.testsuites
    ? parsed.testsuites.flatMap((ts) => ts.testsuite ?? [])
    : (parsed.testsuite ?? []);

  const insertedAt = new Date().toISOString();
  const rows = [];

  for (const suite of suites) {
    const runAt = suite["@_timestamp"] ?? null;
    const suiteName = suite["@_name"] ?? null;

    for (const tc of suite.testcase ?? []) {
      rows.push({
        run_at: runAt,
        inserted_at: insertedAt,
        repo,
        workflow,
        is_default_branch: isDefaultBranch,
        commit_sha: commitSha,
        github_run_id: runId,
        test_type: testType,
        suite_name: suiteName,
        classname: tc["@_classname"] ?? null,
        test_name: tc["@_name"] ?? null,
        status: deriveStatus(tc),
        duration_seconds: parseFloat(tc["@_time"]) || 0,
      });
    }
  }

  return rows;
}

(async function run() {
  const files = fs.globSync(xmlPath);

  if (files.length === 0) {
    console.log(`No XML files found matching ${xmlPath}, skipping.`);
    return;
  }

  const tableRef = new BigQuery({ projectId }).dataset(dataset).table(table);
  let total = 0;

  for (const file of files) {
    const rows = parseFile(file);
    if (rows.length === 0) continue;
    await tableRef.insert(rows);
    console.log(`${file}: inserted ${rows.length} rows`);
    total += rows.length;
  }

  console.log(`Total rows inserted: ${total}`);
})().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
