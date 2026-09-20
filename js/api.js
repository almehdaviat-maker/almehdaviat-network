const YouTubeAPI = {
  API_KEY: 'AIzaSyAUvucwHFCB8mU6NOEet5S20BeH33Wrw_0',
  CHANNEL_ID: 'UCqkCkc5-AeYPJMdAummM_xg',
  BASE_URL: 'https://www.googleapis.com/youtube/v3',
  CACHE_KEY: 'yt_cache',
  CACHE_24H: 24 * 60 * 60 * 1000,
  CACHE_4H: 4 * 60 * 60 * 1000,

  async _fetch(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  _getCache(key, duration) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      const data = JSON.parse(item);
      if (Date.now() - data.ts > (duration || this.CACHE_24H)) {
        localStorage.removeItem(key);
        return null;
      }
      return data.value;
    } catch { return null; }
  },

  _setCache(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify({ value, ts: Date.now() }));
    } catch(e) {}
  },

  async getPlaylists(maxResults = 50) {
    const key = `${this.CACHE_KEY}_pl_${maxResults}`;
    const cached = this._getCache(key, this.CACHE_24H);
    if (cached) return cached;

    const url = `${this.BASE_URL}/playlists?key=${this.API_KEY}&channelId=${this.CHANNEL_ID}&part=snippet,contentDetails&maxResults=${maxResults}`;
    const data = await this._fetch(url);
    if (!data.items) return [];
    const result = data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      videoCount: item.contentDetails.itemCount,
      published: item.snippet.publishedAt,
      url: `https://www.youtube.com/playlist?list=${item.id}`
    }));
    this._setCache(key, result);
    return result;
  },

  async getPlaylistItems(playlistId, maxResults = 50) {
    const key = `${this.CACHE_KEY}_pi_${playlistId}_${maxResults}`;
    const cached = this._getCache(key, this.CACHE_4H);
    if (cached) return cached;

    const url = `${this.BASE_URL}/playlistItems?key=${this.API_KEY}&playlistId=${playlistId}&part=snippet&maxResults=${maxResults}`;
    const data = await this._fetch(url);
    if (!data.items) return [];
    const result = data.items
      .filter(item => item.snippet.resourceId?.videoId)
      .map(item => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
        published: item.snippet.publishedAt,
        publishedDate: new Date(item.snippet.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
      }));
    this._setCache(key, result);
    return result;
  },

  async getLatestVideos(count = 3) {
    const key = `${this.CACHE_KEY}_latest_${count}`;
    const cached = this._getCache(key, this.CACHE_4H);
    if (cached) return cached;

    try {
      const playlists = await this.getPlaylists(50);
      const sorted = playlists.sort((a, b) => b.videoCount - a.videoCount);
      let all = [];
      const seen = new Set();

      for (const pl of sorted) {
        if (all.length >= count * 5) break;
        const items = await this.getPlaylistItems(pl.id, 10);
        for (const item of items) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            all.push(item);
          }
        }
      }

      if (all.length === 0) return [];

      // Get real publish dates from videos endpoint (1 unit for up to 50 IDs)
      const ids = all.map(v => v.id).join(',');
      const url = `${this.BASE_URL}/videos?key=${this.API_KEY}&id=${ids}&part=snippet`;
      const data = await this._fetch(url);
      const dateMap = {};
      (data.items || []).forEach(item => {
        dateMap[item.id] = item.snippet.publishedAt;
      });

      // Update each video with real publish date
      all.forEach(v => {
        if (dateMap[v.id]) {
          v.published = dateMap[v.id];
          v.publishedDate = new Date(dateMap[v.id]).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        }
      });

      // Sort by REAL publish date - latest first
      all.sort((a, b) => new Date(b.published) - new Date(a.published));
      const result = all.slice(0, count);
      this._setCache(key, result);
      return result;
    } catch(e) {
      console.error('getLatestVideos failed:', e);
      return [];
    }
  },

  async checkLiveNow() {
    const key = `${this.CACHE_KEY}_live`;
    const cached = this._getCache(key, this.CACHE_4H);
    if (cached !== undefined && cached !== null) return cached;

    try {
      const url = `${this.BASE_URL}/search?key=${this.API_KEY}&channelId=${this.CHANNEL_ID}&part=snippet&type=video&eventType=live&maxResults=1`;
      const data = await this._fetch(url);
      if (!data.items || data.items.length === 0) {
        this._setCache(key, null);
        return null;
      }
      const result = {
        id: data.items[0].id.videoId,
        title: data.items[0].snippet.title,
        thumbnail: data.items[0].snippet.thumbnails?.high?.url,
        embedUrl: `https://www.youtube.com/embed/${data.items[0].id.videoId}`
      };
      this._setCache(key, result);
      return result;
    } catch(e) {
      return null;
    }
  }
};
