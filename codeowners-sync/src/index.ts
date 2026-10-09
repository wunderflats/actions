import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as core from "@actions/core";
import { codeownersErrors, teamAccessProblem } from "./github.ts";
import { type Files, generate, MapError, teamsOf } from "./map.ts";
import { checkLocal, firstDifference } from "./sync.ts";

function readIfExists(path: string): string | null {
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

function trackedFiles(root: string): string[] {
  const out = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  });
  return out.split("\0").filter(Boolean);
}

if (process.env.GITHUB_ACTIONS === "true") {
  await runAction();
} else {
  runCli(process.argv.slice(2));
}

async function runAction() {
  try {
    const files: Files = {
      map: core.getInput("map-path") || ".github/critical-paths.yml",
      codeowners: core.getInput("codeowners-path") || ".github/CODEOWNERS",
    };
    const appToken = core.getInput("app-token", { required: true });
    const githubToken = core.getInput("github-token", { required: true });
    const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
    const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? "/").split("/");

    let repoFiles: string[];
    try {
      repoFiles = trackedFiles(root);
    } catch {
      core.setFailed(
        "No git checkout found. Run actions/checkout before codeowners-sync.",
      );
      return;
    }

    const codeownersText = readIfExists(join(root, files.codeowners));
    const report = checkLocal(
      readIfExists(join(root, files.map)),
      codeownersText,
      files,
      repoFiles,
    );

    for (const team of teamsOf(report.rules)) {
      const problem = await teamAccessProblem(team, { owner, repo }, appToken);
      if (problem) report.errors.push(problem);
    }

    if (codeownersText !== null) {
      const ref = headSha();
      for (const e of await codeownersErrors(
        { owner, repo },
        ref,
        githubToken,
      )) {
        report.errors.push(`GitHub rejects a CODEOWNERS line: ${e}`);
      }
    }

    for (const w of report.warnings) core.warning(w);
    for (const e of report.errors) core.error(e);

    await writeSummary(report, codeownersText, files);

    if (report.errors.length > 0) {
      core.setFailed(
        `codeowners-sync found ${report.errors.length} problem(s).`,
      );
    } else {
      core.info(
        `CODEOWNERS matches ${files.map}: ${report.rules.length} owned paths.`,
      );
    }
  } catch (err) {
    // Fail closed: an error in the gate never lets a PR through.
    core.setFailed(
      `codeowners-sync could not finish: ${(err as Error).message}`,
    );
  }
}

function headSha(): string {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && existsSync(eventPath)) {
    const event = JSON.parse(readFileSync(eventPath, "utf8"));
    const sha = event.pull_request?.head?.sha;
    if (sha) return sha;
  }
  return process.env.GITHUB_SHA ?? "HEAD";
}

async function writeSummary(
  report: ReturnType<typeof checkLocal>,
  actual: string | null,
  files: Files,
) {
  const s = core.summary.addHeading("codeowners-sync", 2);
  if (report.errors.length === 0) {
    s.addRaw(
      `CODEOWNERS matches ${files.map}. ${report.rules.length} paths have owners.\n\n`,
    );
  } else {
    s.addRaw("**Problems**\n\n").addList(report.errors);
  }
  if (report.warnings.length > 0)
    s.addRaw("**Warnings**\n\n").addList(report.warnings);
  if (report.expected !== null && actual !== report.expected) {
    if (actual !== null)
      s.addRaw(`${firstDifference(report.expected, actual)}\n\n`);
    s.addRaw(`Expected ${files.codeowners}:\n\n`).addCodeBlock(report.expected);
  }
  await s.write();
}

function runCli(args: string[]) {
  const flag = (name: string, fallback: string) => {
    const i = args.indexOf(name);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
  };
  const root = flag("--root", process.cwd());
  const files: Files = {
    map: flag("--map", ".github/critical-paths.yml"),
    codeowners: flag("--codeowners", ".github/CODEOWNERS"),
  };

  if (args.includes("--write")) {
    const mapText = readIfExists(join(root, files.map));
    if (mapText === null) {
      console.error(`${files.map} is missing.`);
      process.exit(1);
    }
    try {
      const { rules, text } = generate(mapText, files);
      writeFileSync(join(root, files.codeowners), text);
      console.log(`Wrote ${files.codeowners}: ${rules.length} owned paths.`);
    } catch (err) {
      if (!(err instanceof MapError)) throw err;
      for (const p of err.problems) console.error(`${files.map}: ${p}`);
      process.exit(1);
    }
    return;
  }

  if (args.includes("--check")) {
    const codeownersText = readIfExists(join(root, files.codeowners));
    const report = checkLocal(
      readIfExists(join(root, files.map)),
      codeownersText,
      files,
      trackedFiles(root),
    );
    for (const w of report.warnings) console.warn(`warning: ${w}`);
    for (const e of report.errors) console.error(`error: ${e}`);
    if (
      report.expected !== null &&
      codeownersText !== null &&
      codeownersText !== report.expected
    ) {
      console.error(firstDifference(report.expected, codeownersText));
    }
    console.log(
      "Team access is checked in CI only. It needs the wf-review-gates App token.",
    );
    process.exit(report.errors.length > 0 ? 1 : 0);
  }

  console.error(
    "Usage: node codeowners-sync/dist/index.js --write | --check [--root DIR] [--map PATH] [--codeowners PATH]",
  );
  process.exit(2);
}
