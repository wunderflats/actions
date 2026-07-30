import fs from "node:fs";
import path from "node:path";
import { Storage } from "@google-cloud/storage";

const xmlPath = process.env.INPUT_XML_PATH;
const testType = process.env.INPUT_TEST_TYPE;
const bucketName = process.env.INPUT_BUCKET;

const repo = process.env.GITHUB_REPOSITORY;
const runId = process.env.GITHUB_RUN_ID;
const runAttempt = process.env.GITHUB_RUN_ATTEMPT ?? "1";

(async function run() {
  const files = fs.globSync(xmlPath);

  if (files.length === 0) {
    console.log(`No XML files found matching ${xmlPath}, skipping.`);
    return;
  }

  const storage = new Storage();
  const bucket = storage.bucket(bucketName);
  const repoSlug = repo.replace("/", "-");
  const prefix = `${repoSlug}/${runId}/${runAttempt}/${testType}`;

  for (const file of files) {
    const dest = `${prefix}/${path.basename(file)}`;
    await bucket.upload(file, { destination: dest });
    console.log(`Uploaded ${file} → gs://${bucketName}/${dest}`);
  }
})().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
