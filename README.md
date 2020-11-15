# vodtwitch

> Download any vod on Twitch

<a href="https://npmjs.org/package/vodtwitch">
  <img src="https://img.shields.io/npm/v/vodtwitch.svg"
       alt="npm version">
</a>
<a href="https://github.com/matschik/vodtwitch/blob/master/LICENSE">
  <img src="https://img.shields.io/npm/l/vodtwitch.svg"
       alt="license">
</a>
<br/>

## Install

```bash
npm i -g vodtwitch
# yarn global add vodtwitch
```

## Usage

### CLI
```sh
$ vodtwitch 787450673
$ vodtwitch https://www.twitch.tv/videos/787450673
```

It will save to the current directory as `{vodID}.ts`.

### NodeJS

```
const vodtwitch = require("vodtwitch");

async function main(){
  await vodtwitch(787450673)
}

main().catch(err => console.error(err))
```
