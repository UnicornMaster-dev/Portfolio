# Video Placeholders Guide

## 📹 How to Add Your Project Videos

Place your project demo videos in this `/videos/` folder.

### Recommended Video Specifications:

**Format:**
- MP4 (H.264 codec) - Best compatibility
- WebM (VP9 codec) - Alternative for modern browsers

**Resolution:**
- 1920x1080 (Full HD) - Recommended
- 1280x720 (HD) - Minimum
- Keep aspect ratio 16:9

**File Size:**
- Aim for under 50MB per video
- Use video compression tools if needed

**Duration:**
- 30-90 seconds ideal for demos
- Show key features quickly

### Video Names Referenced in HTML:

1. `project-demo.mp4` - Featured project on homepage
2. `ecommerce-demo.mp4` - E-commerce project
3. `fitness-demo.mp4` - Fitness app project
4. `dashboard-demo.mp4` - Analytics dashboard project

### Tools for Creating Demo Videos:

- **Screen Recording:**
  - OBS Studio (Free, Windows/Mac/Linux)
  - ShareX (Free, Windows)
  - QuickTime (Mac)
  - Windows Game Bar (Windows 10/11)

- **Video Editing:**
  - DaVinci Resolve (Free)
  - Shotcut (Free)
  - OpenShot (Free)

- **Video Compression:**
  - HandBrake (Free)
  - FFmpeg (Command line)
  - Online tools: cloudconvert.com

### Quick FFmpeg Command for Optimization:

```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

This will:
- Compress the video while maintaining quality
- Make it web-optimized
- Reduce file size significantly

### Tips for Great Demo Videos:

1. **Plan your recording** - Know what to show before recording
2. **Clean up your screen** - Close unnecessary apps and notifications
3. **Use smooth mouse movements** - Avoid jerky cursor motion
4. **Add captions** - Text overlays explaining features (optional)
5. **Test on slow connections** - Make sure videos load reasonably fast
6. **Create poster images** - Use a frame from the video as thumbnail

### Poster Images:

The HTML uses poster images (thumbnails) for videos:
```html
<video controls poster="images/pic01.jpg">
```

Create poster images by:
1. Taking a screenshot of an interesting frame
2. Saving it in `/images/` folder
3. Reference it in the poster attribute

### Alternative: YouTube/Vimeo Embedding

If you prefer to host videos on YouTube or Vimeo:

Replace the video tag with an iframe:

```html
<!-- YouTube -->
<div class="video-container">
    <iframe width="100%" height="500" 
        src="https://www.youtube.com/embed/VIDEO_ID" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
    </iframe>
</div>

<!-- Vimeo -->
<div class="video-container">
    <iframe width="100%" height="500" 
        src="https://player.vimeo.com/video/VIDEO_ID" 
        frameborder="0" 
        allow="autoplay; fullscreen; picture-in-picture" 
        allowfullscreen>
    </iframe>
</div>
```

Benefits of external hosting:
- No file size concerns
- Better streaming performance
- Automatic quality adjustment
- View analytics

---

**Remember:** Videos significantly enhance your portfolio by showing your projects in action!

