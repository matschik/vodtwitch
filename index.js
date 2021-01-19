const axios = require("axios");
const fs = require("fs");
const path = require("path");
const m3u8Parser = require("m3u8-parser");
const dayjs = require("dayjs");
const youtubeuploader = require('extra-youtubeuploader');
const dayjsDuration = require("dayjs/plugin/duration");
dayjs.extend(dayjsDuration);

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

async function downloadVodURI(writer, playlist, p) {
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

    console.log(`
Location: ${path.resolve(process.cwd(), writer.path)}
Quality: ${playlist.attributes.RESOLUTION.height}p (${playlist.attributes.VIDEO})
Duration: ${humanizeDuration(dayjs.duration(seconds * 1000))}`);

  const startIndex = playlistM3U.discontinuityStarts.length
    ? playlistM3U.discontinuityStarts[0]
    : 0;
  for (let i = startIndex; i < segments.length; i++) {
    const segment = segments[i];
    var o = segments.length - i;
    var left = o / 60;
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(
        `Progress: ${Math.round((i * 100) / segments.length)}% (${i}/${
          segments.length - 1
        }) Until the end: ${left.toFixed(2)} min`
      );
    await downloadChunk(writer, `${playlistBaseURL}/${segment.uri}`);
    //break;
  }
     
  writer.end(alegowienko(p));
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
    url: `https://usher.ttvnw.net/vod/${vodId}.m3u8`,
    params: {
      token,
      sig,
      allow_source: 'true',
    },
  });
  return parseM3U8(res.data);
}

async function fetchVodCredentials(vodID) {
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
        vodID: String(vodID),
        playerType: "site",
      },
    }),
    headers: {
      "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
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

async function downloadTwitchVod(vodIdOrURL, k = {}) {
  var o = Object.assign({}, k, {video: `${vodIdOrURL}.mp4`});
  if (!vodIdOrURL) {
    throw new Error("VOD ID or URL is missing");
  }
  const vodId = isValidUrl(vodIdOrURL)
    ? vodIdOrURL.split("/").pop()
    : vodIdOrURL;
  try {
    const vodCredentials = await fetchVodCredentials(vodId);
    const manifestVods = await fetchVodM3u8(vodId, vodCredentials);
    const bestPlaylist = manifestVods.playlists[0];
    const writer = fs.createWriteStream(`${vodId}.mp4`);
    await downloadVodURI(writer, bestPlaylist, o);
  } catch (err) {
    console.error("\nFailed to download VOD:");
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err);
    }
  }
}
function alegowienko(o){
  youtubeuploader(o);
}
module.exports = downloadTwitchVod;
