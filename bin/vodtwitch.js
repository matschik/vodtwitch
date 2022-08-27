#!/usr/bin/env node
import { Command } from "commander";
import downloadTwitchVod from "../index.js";
import pkg from "../package.json" assert { type: "json" };

async function main() {
  const vodtwitch = new Command();
  vodtwitch
    .version(pkg.version, "-v, --version", "output the current version")
    .option("-o, --output <path>", "destination directory path")
    .option("-s, --silent", "disable log output")
    .parse(process.argv);

  const [vodIdOrUrl] = vodtwitch.args;
  await downloadTwitchVod(vodIdOrUrl, {
    log: !vodtwitch.silent,
    outputDir: vodtwitch.output,
  });
}

main().catch(console.error);
