import axios from "axios";
import { createWriteStream } from "fs";
import { stat } from "fs/promises";
import { resolve } from "path";
import m3u8Parser from "m3u8-parser";
import dayjs from "dayjs";
import dayjsDuration from "dayjs/plugin/duration.js";

dayjs.extend(dayjsDuration);

let canLog = false;

export default async function downloadTwitchVod(vodIdOrURL, options = {}) {
  canLog = !!options.log;

  let outputDir = process.cwd();
  if (options.outputDir) {
    const dirStats = await stat(options.outputDir);
    if (!dirStats.isDirectory()) {
      throw new Error(
        `Specified output is not a directory: ${options.outputDir}`
      );
    }
    outputDir = options.outputDir;
  }

  if (!vodIdOrURL) {
    throw new Error("VOD ID or URL argument is missing");
  }
  const vodId = isValidUrl(vodIdOrURL)
    ? vodIdOrURL.split("/").pop()
    : vodIdOrURL.toString();

  try {
    const vodCredentials = await fetchVodCredentials(vodId, options.oauthToken);
    const manifestVods = await fetchVodM3u8(vodId, vodCredentials);
    const bestPlaylist = manifestVods.playlists[0];
    const writer = createWriteStream(resolve(outputDir, `${vodId}.ts`));
    await downloadVodURI(writer, bestPlaylist);
  } catch (err) {
    if (err.response) {
      console.error("\nFailed to download VOD:");
      console.error(err.response.data);
    } else {
      console.error(err);
    }
  }
}

function humanizeDuration(duration) {
  let str = "";
  const hours = duration.hours();
  const minutes = duration.minutes();
  if (hours) {
    str += `${hours}h `;
  }
  if (minutes) {
    str += `${minutes}m`;
  } else {
    str += ` 00m`;
  }
  return str;
}

async function downloadVodURI(writer, playlist) {
  // segments
  const playlistM3U = await fetchVodPlaylistM3u8(playlist.uri);
  const segments = playlistM3U.segments;

  // baseURL
  let playlistBaseURL = playlist.uri.split("/");
  playlistBaseURL.pop();
  playlistBaseURL = playlistBaseURL.join("/");
  const seconds = segments.reduce((acc, segment) => {
    return acc + segment.duration;
  }, 0);

  if (canLog) {
    console.log(`
File: ${writer.path}
Quality: ${playlist.attributes.RESOLUTION.height}p (${
      playlist.attributes.VIDEO
    })
Duration: ${humanizeDuration(dayjs.duration(seconds * 1000))}`);
  }

  // @debug
  //fs.writeFileSync("debug.json", JSON.stringify(playlistM3U, null, 2));

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (canLog) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(
        `Progress: ${Math.round((i * 100) / segments.length)}% (${i}/${
          segments.length - 1
        })`
      );
    }
    if (playlistM3U.discontinuityStarts.includes(i)) {
      continue;
    }
    await downloadChunk(writer, `${playlistBaseURL}/${segment.uri}`);
  }

  writer.end();
}

async function downloadChunk(w, downloadUrl) {
  const response = await axios.request({
    method: "GET",
    url: downloadUrl,
    responseType: "stream",
  });
  response.data.pipe(w, { end: false });
  return new Promise((resolve, reject) => {
    response.data.on("end", () => {
      resolve();
    });

    response.data.on("error", (err) => {
      console.error(err);
      reject(err);
    });
  });
}

function parseM3U8(m3uText) {
  // https://wikipedia.org/wiki/M3U
  const parser = new m3u8Parser.Parser();
  parser.push(m3uText);
  parser.end();
  return parser.manifest;
}

async function fetchVodM3u8(vodId, { token, sig } = {}) {
  const res = await axios.request({
    method: "GET",
    url: `https://usher.ttvnw.net/vod/${vodId}.m3u8?allow_source=true`,
    params: {
      token,
      sig,
    },
  });
  return parseM3U8(res.data);
}

async function fetchVodCredentials(vodID, oauthToken) {
  const credentialsRes = await axios.request({
    method: "POST",
    url: "https://gql.twitch.tv/gql",
    data: JSON.stringify({
      operationName: "PlaybackAccessToken_Template",
      query:
        'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}',
      variables: {
        isLive: false,
        login: "",
        isVod: true,
        vodID,
        playerType: "site",
      },
    }),
    headers: {
      "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      ...(oauthToken ? { Authorization: `OAuth ${oauthToken}` } : {}),
    },
  });
  const { videoPlaybackAccessToken } = credentialsRes.data.data;

  return {
    token: videoPlaybackAccessToken.value,
    sig: videoPlaybackAccessToken.signature,
  };
}

async function fetchVodPlaylistM3u8(uri) {
  const res = await axios.get(uri);
  return parseM3U8(res.data);
}

function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }

  return true;
}
