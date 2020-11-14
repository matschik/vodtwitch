const axios = require("axios");
const fs = require("fs");
const m3u8Parser = require("m3u8-parser");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

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
  console.log({
    dest: writer.path,
    quality: playlist.attributes.VIDEO,
    resolution: playlist.attributes.RESOLUTION,
    codec: playlist.attributes.CODECS,
    duration: `${Math.round(
      dayjs.duration(seconds * 1000).asMinutes()
    )} minutes`,
  });

  let startIndex = playlistM3U.discontinuityStarts.length
    ? playlistM3U.discontinuityStarts[0]
    : 0;
  for (let i = startIndex; i < segments.length; i++) {
    const segment = segments[i];
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(
      `${Math.round((i * 100) / segments.length)}% (${i}/${segments.length})`
    );
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
  // https://fr.wikipedia.org/wiki/M3U
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
    },
  });
  return parseM3U8(res.data);
}

async function fetchVodCredentials(vodId) {
  const credentialsRes = await axios.request({
    method: "GET",
    url: `https://api.twitch.tv/api/vods/${vodId}/access_token?oauth_token=undefined&need_https=true&platform=web&player_type=site&player_backend=mediaplayer`,
    headers: {
      "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
    },
  });
  return credentialsRes.data;
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

async function downloadTwitchVod(vodIdOrURL) {
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
    const writer = fs.createWriteStream(`${vodId}.ts`);
    await downloadVodURI(writer, bestPlaylist);
  } catch (err) {
    console.error("\nFailed to download VOD:");
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err);
    }
  }
}

module.exports = downloadTwitchVod;
