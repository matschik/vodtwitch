#!/usr/bin/env node
import { Command } from "commander";
import downloadTwitchVod from "../index.js";
import pkgSync from "pkg-sync";

async function main() {
  const vodtwitch = new Command();
  vodtwitch
    .version(
      pkgSync(import.meta.url).version,
      "-v, --version",
      "output the current version"
    )
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
