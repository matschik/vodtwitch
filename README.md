# vodtwitch + <a href="https://github.com/golangf/youtubeuploader">YoutubeUploader</a>

> Download any public vod from Twitch

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
# with VOD ID
$ vodtwitch 787450673

# you can specify an output directory
$ vodtwitch 787450673 -o my/best/vods

# also works with VOD URL
$ vodtwitch https://www.twitch.tv/videos/787450673

# more command options
$ vodtwitch -h
```

It will save to your current directory as `{vodID}.mp4`.

### NodeJS

```js
const vodtwitch = require("vodtwitch");

vodtwitch({vodID}, {vodTitle}, {vodDate}, { log: true })

```
