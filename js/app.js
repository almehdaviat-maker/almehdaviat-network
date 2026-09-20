const App = {
  init() {
    this.setupNavbar();
    this.setupMobileMenu();
  },

  setupNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  },

  setupMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const links = document.querySelector('.nav-links');
    if (!btn || !links) return;
    btn.addEventListener('click', () => {
      links.classList.toggle('open');
      btn.textContent = links.classList.contains('open') ? '✕' : '☰';
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        btn.textContent = '☰';
      });
    });
  },

  createVideoCard(video) {
    return `
      <a href="${video.url}" target="_blank" rel="noopener" class="video-card">
        <div class="video-thumb">
          <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
          <div class="play-overlay">
            <div class="play-icon">▶</div>
          </div>
        </div>
        <div class="video-info">
          <h3>${video.title}</h3>
          <div class="video-meta">
            <span>${video.publishedDate || ''}</span>
          </div>
        </div>
      </a>
    `;
  },

  showLoading(container) {
    container.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading...</div>
      </div>
    `;
  },

  showEmpty(container, message = 'No content found') {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📺</div>
        <p>${message}</p>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
