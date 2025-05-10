import { execa } from "execa";
import { getFormatValue, getFormats, ytdlPath, ffmpegPath, ffprobePath, forceIpv4 } from "../utils.js";
import fs from "node:fs";
import path from "node:path";
import { Video } from "../types.js";
import { Toast } from "@raycast/api";

export async function downloadVideo({ url, directory }: { url: string; directory: string }) {
  // Validate executables exist
  if (!fs.existsSync(ytdlPath)) {
    throw new Error("yt-dlp is not installed");
  }
  if (!fs.existsSync(ffmpegPath)) {
    throw new Error("ffmpeg is not installed");
  }
  if (!fs.existsSync(ffprobePath)) {
    throw new Error("ffprobe is not installed");
  }

  // Show toast for video lookup
  const lookupToast = new Toast({ style: Toast.Style.Animated, title: "Looking for video details..." });
  lookupToast.show();

  // Get video info and available formats
  const videoInfo = await execa(
    ytdlPath,
    [forceIpv4 ? "--force-ipv4" : "", "--dump-json", "--format-sort=resolution,ext,tbr", url].filter(Boolean)
  );

  const video = JSON.parse(videoInfo.stdout) as Video;

  // Confirm video found
  lookupToast.style = Toast.Style.Success;
  lookupToast.title = "Video found";
  lookupToast.message = video.title;

  // Check if it's a live stream
  if (video.live_status !== "not_live" && video.live_status !== undefined) {
    throw new Error("Live streams are not supported");
  }

  // Set up download options
  const options: string[] = ["-P", directory, "--output", path.join(directory, "%(title)s.%(ext)s")];

  // Get the best video+audio format
  const formats = getFormats(video);
  const bestFormat = formats["Video"][0]; // First format in Video category is best quality
  if (bestFormat) {
    const formatValue = getFormatValue(bestFormat);
    const [downloadFormat, recodeFormat] = formatValue.split("#");
    options.push("--ffmpeg-location", ffmpegPath);
    options.push("--format", downloadFormat);
    options.push("--recode-video", recodeFormat);
  }

  options.push("--print", "after_move:filepath");

  // Show toast for download start
  const downloadToast = new Toast({ style: Toast.Style.Animated, title: "Downloading video..." });
  downloadToast.show();

  // Execute download
  const result = await execa(ytdlPath, [...options, url]);

  if (result.failed) {
    throw new Error(`Failed to download video: ${result.stderr}`);
  }

  // Extract file path from output
  const filePath = path.join(directory, `${video.title}.mp4`);

  if (!fs.existsSync(filePath)) {
    throw new Error("Could not determine downloaded file path. Ensure the file was downloaded correctly.");
  }

  // Confirm download complete
  downloadToast.style = Toast.Style.Success;
  downloadToast.title = "Download complete";
  downloadToast.message = `Saved to: ${filePath}`;

  return {
    downloadedPath: filePath,
    fileName: path.basename(filePath),
    title: video.title,
    duration: video.duration,
  };
}

export default downloadVideo;
