const express = require('express');
const ytdl = require('@distube/ytdl-core');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// Video Info Endpoint
app.get('/api/info', async (req, res) => {
  const videoURL = req.query.url;
  if (!videoURL || !ytdl.validateURL(videoURL)) {
    return res.status(400).json({ error: 'Valid YouTube URL pathan' });
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const formats = ytdl.filterFormats(info.formats, 'audioandvideo');
    
    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.pop().url,
      formats: formats.map(f => ({
        quality: f.qualityLabel,
        container: f.container,
        itag: f.itag
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Video info fetch korte somosya hoyeche', details: err.message });
  }
});

// Download Endpoint
app.get('/api/download', async (req, res) => {
  const { url, itag } = req.query;
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send('Invalid URL');
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_");
    
    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
    ytdl(url, { quality: itag || 'highest' }).pipe(res);
  } catch (err) {
    res.status(500).send('Download failed');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
