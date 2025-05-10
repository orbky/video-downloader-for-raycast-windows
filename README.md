# Video Downloader
> This is a fork of [video-downloader](https://github.com/raycast/extensions/tree/d860cced6e0e70dd08e42ab4b812e98c30ced567/extensions/video-downloader/)
> Download videos from YouTube, Twitter, Twitch, Instagram, Bilibili and more using yt-dlp CLI

![video-downloader-1.png](metadata%2Fvideo-downloader-1.png)

## Installation

To use this extension, you must have `yt-dlp` and `ffmpeg` installed on your machine.

The easiest way to install this is using [Scoop](https://scoop.sh/). After you have Scoop installed, run the
following command in your terminal:

```powershell
scoop install yt-dlp
```
```powershell
scoop install ffmpeg
```

Depending on your Windows version, the package might be located in a different path than the one set by the extension. To
check where `ffmpeg` was installed, run:

```powershell
where.exe ffmpeg
```

Then, update the path in the extension preferences to match the output of the above command.

You'll also need `ffprobe`, which is usually installed with `ffmpeg`. Just run `where.exe ffprobe` and update the path
accordingly.

## Supported Sites

See <https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md>.

## **FAQs**

### **Is there a YouTube downloader that actually works?**

Yes, Raycast's Video Downloader is consistently updated to ensure reliable functionality.

<!--
### **Can I download clips from YouTube?**

Absolutely\! Our extension supports downloading full videos, clips, and even YouTube Shorts.
-->

### **How do I download a YouTube video with a manipulated URL?**

Our downloader handles various URL formats. Just paste the link, and we'll take care of the rest.
