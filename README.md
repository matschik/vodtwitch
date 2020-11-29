# vodtwitch + <a href="https://github.com/golangf/youtubeuploader">YoutubeUploader</a>

> Download any public vod from Twitch and automatically upload at YouTube
<br /> from 144p to 1080p

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

## Setup YoutubeUploader

### install

1. Download for your OS from <a href="https://github.com/golangf/youtubeuploader/releases">releases</a>.
2. Extract it to a directory and add the directory to `PATH`.


### get client id

1. Create an [account] on [Google Cloud Platform].
2. Create a [new project], and select it.
3. Enable [YouTube Data API] for the project.
4. Add [credentials] to your project.
5. Which API are you using? `YouTube Data API v3`.
6. Where will you be calling the API from? `Web server`.
7. What data will you be accessing? `User data`.
8. Select `What credentials do I need?`.
9. Create an OAuth 2.0 client ID.
10. Name: `youtubeuploader` (your choice).
11. Authorized JavaScript origins: `http://localhost:8080`.
12. Authorized redirect URIs: `http://localhost:8080/oauth2callback`.
13. Select `Create OAuth client ID`.
14. Set up the OAuth 2.0 consent screen.
15. Email address: (it should be correct).
16. Product name shown to users: `youtubeuploader` (your choice).
17. Select `Continue`.
18. Download credentials.
19. Select `Download`, then `Done`.
21. Copy downloaded file (`client_id.json`) to a directory.


### get client token

1. Open [console] in the above directory.
2. Run `youtubeuploader -v client_id.json`.
3. OAuth page will be opened in browser.
3. Choose an account, videos will be uploaded here.
4. `youtubeuploader` wants to access your Google Account.
5. Select `Allow`, and close browser window.
6. `client_token.json` should be created.

## Usage

It will save to your current directory as `{vodID}.mp4`.

### NodeJS

```js
const vodtwitch = require("vodtwitch");

vodtwitch({vodID}, {vodTitle}, {vodDate}, { log: true })

```
