#!/usr/bin/env node
const { Command } = require("commander");
const downloadTwitchVod = require("../");
const pkg = require("../package.json");

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

main().catch((err) => console.error(err));
