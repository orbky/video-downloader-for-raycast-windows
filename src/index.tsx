import { Action, ActionPanel, List, Icon, Toast, getPreferenceValues } from "@raycast/api";
import { useState } from "react";
import { isValidUrl } from "./utils.js";
import { downloadVideo } from "./tools/download-video.js";
import { execa } from "execa";
import path from "path";
import os from "os";

const { ytdlPath, ffmpegPath, forceIpv4 } = getPreferenceValues<ExtensionPreferences>();
const downloadDirectory = path.join(os.homedir(), "Downloads");

export default function DownloadVideo() {
  const [searchText, setSearchText] = useState<string>("");
  const [videoDetails, setVideoDetails] = useState<{ title: string; duration: string; filePath: string; thumbnail?: string; fileSize?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchVideoTitle(url: string) {
    try {
      const result = await execa(
        ytdlPath,
        [forceIpv4 ? "--force-ipv4" : "", "--dump-json", url].filter(Boolean)
      );
      const video = JSON.parse(result.stdout);

      // Format duration dynamically
      const durationInSeconds = video.duration;
      let formattedDuration = "";
      if (durationInSeconds >= 3600) {
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        formattedDuration = `${hours}h ${minutes}m`;
      } else if (durationInSeconds >= 60) {
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        formattedDuration = `${minutes}m ${seconds}s`;
      } else {
        formattedDuration = `${durationInSeconds}s`;
      }

      const fileSizeInBytes = video.filesize || video.filesize_approx || 0;
      let formattedFileSize = "Unknown";
      if (fileSizeInBytes >= 1e9) {
        formattedFileSize = `${(fileSizeInBytes / 1e9).toFixed(2)} GB`;
      } else if (fileSizeInBytes >= 1e6) {
        formattedFileSize = `${(fileSizeInBytes / 1e6).toFixed(2)} MB`;
      } else if (fileSizeInBytes >= 1e3) {
        formattedFileSize = `${(fileSizeInBytes / 1e3).toFixed(2)} KB`;
      } else if (fileSizeInBytes > 0) {
        formattedFileSize = `${fileSizeInBytes} Bytes`;
      }

      setVideoDetails({
        title: video.title,
        duration: formattedDuration,
        filePath: "",
        thumbnail: video.thumbnail || "No thumbnail available",
        fileSize: formattedFileSize,
      });
      setError(null);
    } catch (err) {
      setError("Failed to fetch video title. Please check the URL.");
      setVideoDetails(null);
    }
  }

  async function handleDownload(url: string) {
    try {
      const result = await downloadVideo({ url, directory: downloadDirectory });
      setVideoDetails((prev) => prev && { ...prev, filePath: result.downloadedPath });
      const toast = new Toast({ style: Toast.Style.Success, title: "Download Complete" });
      toast.message = `Saved to: ${result.downloadedPath}`;
      toast.show();
    } catch (err) {
      const toast = new Toast({ style: Toast.Style.Failure, title: "Download Failed" });
      toast.message = err instanceof Error ? err.message : String(err);
      toast.show();
    }
  }

  return (
    <List
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Enter a video URL..."
      isShowingDetail={!!videoDetails || !!error}
    >
      <List.EmptyView
        icon={Icon.Video}
        title="Enter a video URL to fetch its details."
        actions={
          <ActionPanel>
            <Action
              title="Fetch Video Details"
              icon={Icon.MagnifyingGlass}
              onAction={() => {
                if (isValidUrl(searchText)) {
                  fetchVideoTitle(searchText);
                } else {
                  setError("Invalid URL. Please enter a valid video URL.");
                }
              }}
            />
            {videoDetails && (
              <Action
                title="Download Video"
                icon={Icon.Download}
                shortcut={{ modifiers: ["ctrl"], key: "enter" }}
                onAction={() => handleDownload(searchText)}
              />
            )}
          </ActionPanel>
        }
      />
      {videoDetails && (
        <List.Item
          title={videoDetails.title}
          detail={
            <List.Item.Detail
              markdown={`![Thumbnail](${videoDetails.thumbnail})\n\n**Title:** ${videoDetails.title}\n\n**Duration:** ${videoDetails.duration}\n\n**File Size:** ${videoDetails.fileSize}\n\n**File Path:** ${videoDetails.filePath || "Not downloaded yet"}`}
            />
          }
          actions={
            <ActionPanel>
              <Action
                title="Download Video"
                icon={Icon.Download}
                shortcut={{ modifiers: ["ctrl"], key: "enter" }}
                onAction={() => handleDownload(searchText)}
              />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}
