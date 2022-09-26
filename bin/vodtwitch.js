#!/usr/bin/env node
import { Command } from "commander";
import downloadTwitchVod from "../index.js";
import fs from "fs/promises";

async function main() {
  const pkg = JSON.parse(await fs.readFile("./package.json", "utf-8"));
  const vodtwitch = new Command();
  vodtwitch
    .version(pkg.version, "-v, --version", "output the current version")
    .option("-o, --output <path>", "destination directory path")
    .option("-s, --silent", "disable log output")
    .option(
      "-t, --token <token>",
      "add oauth token to request for private vods"
    )
    .parse(process.argv);

  const [vodIdOrUrl] = vodtwitch.args;

  const { silent, outputDir, token } = vodtwitch.opts();

  await downloadTwitchVod(vodIdOrUrl, {
    log: !silent,
    outputDir,
    oauthToken: token,
  });
}

main().catch(console.error);
