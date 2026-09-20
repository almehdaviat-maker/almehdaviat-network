const Player = {
  async init() {
    const videoId = App.getVideoIdFromURL();
    if (!videoId) {
      window.location.href = 'index.html';
      return;
    }

    this.loadPlayer(videoId);
    await this.loadVideoDetails(videoId);
    await this.loadSidebar(videoId);
    await this.loadRelated(videoId);
  },

  loadPlayer(videoId) {
    const embed = document.getElementById('videoEmbed');
    if (embed) {
      embed.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
    }
  },

  async loadVideoDetails(videoId) {
    const titleEl = document.getElementById('videoTitle');
    const statsEl = document.getElementById('videoStats');
    const descEl = document.getElementById('videoDescription');

    try {
      const details = await YouTubeAPI.getVideoDetails(videoId);
      if (details && details[0]) {
        const v = details[0];
        if (titleEl) titleEl.textContent = v.title;
        if (statsEl) {
          let stats = '';
          if (v.viewCount) stats += '<span>' + v.viewCount + ' views</span>';
          if (v.publishedDate) stats += '<span>•</span><span>' + v.publishedDate + '</span>';
          statsEl.innerHTML = stats;
        }
        if (descEl) descEl.textContent = v.description;
        return;
      }
    } catch(e) {
      console.log('API failed for video details');
    }

    try {
      const data = await RSS.fetchFeed();
      const video = data.videos.find(function(v) { return v.id === videoId; });
      if (video) {
        if (titleEl) titleEl.textContent = video.title;
        if (statsEl) statsEl.innerHTML = '<span>' + video.publishedDate + '</span>';
        if (descEl) descEl.textContent = video.description;
      }
    } catch(e) {
      console.log('RSS also failed');
    }
  },

  async loadSidebar(currentVideoId) {
    const container = document.getElementById('playlistSidebar');
    if (!container) return;

    App.showLoading(container);

    try {
      const videos = await YouTubeAPI.getVideos(20);
      if (videos && videos.length > 0) {
        container.innerHTML = videos.map(function(v) {
          return App.createSidebarVideo(v, v.id === currentVideoId);
        }).join('');
        return;
      }
    } catch(e) {
      console.log('API failed for sidebar');
    }

    const data = await RSS.fetchFeed();
    if (!data.videos || data.videos.length === 0) {
      App.showEmpty(container, 'Playlist not found');
      return;
    }

    container.innerHTML = data.videos.map(function(v) {
      return App.createSidebarVideo(v, v.id === currentVideoId);
    }).join('');
  },

  async loadRelated(currentVideoId) {
    const container = document.getElementById('relatedVideos');
    if (!container) return;

    App.showLoading(container);

    try {
      const videos = await YouTubeAPI.getVideos(12);
      if (videos && videos.length > 0) {
        const related = videos.filter(function(v) { return v.id !== currentVideoId; }).slice(0, 8);
        container.innerHTML = '<div class="video-grid">' + related.map(function(v) {
          return App.createVideoCard(v);
        }).join('') + '</div>';
        return;
      }
    } catch(e) {
      console.log('API failed for related');
    }

    const data = await RSS.fetchFeed();
    if (!data.videos || data.videos.length === 0) {
      App.showEmpty(container, 'No related videos');
      return;
    }

    const related = data.videos.filter(function(v) { return v.id !== currentVideoId; }).slice(0, 8);
    container.innerHTML = '<div class="video-grid">' + related.map(function(v) {
      return App.createVideoCard(v);
    }).join('') + '</div>';
  }
};

document.addEventListener('DOMContentLoaded', function() { Player.init(); });
