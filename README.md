# vodtwitch + <a href="https://github.com/golangf/youtubeuploader">YoutubeUploader</a>

> Download any public vod from Twitch and automatically upload at YouTube
> from 144p to 1080p

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
npm install vodtwitch
# yarn add vodtwitch
```

## Usage

It will save to your current directory as `{vodID}.mp4`.

### NodeJS

```js
const vodtwitch = require("vodtwitch");

vodtwitch({vodID}, {vodTitle}, {vodDate}, { log: true })

```
