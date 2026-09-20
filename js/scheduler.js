const Scheduler = {
  STORAGE_KEY: 'almehdaviat_scheduler',
  DEFAULT_IMAGES: {
    0: { day: 'Sunday', theme: 'Mola Ali ka Haram', image: 'assets/scheduler/sunday.jpg', alt: 'Mola Ali ka Haram' },
    1: { day: 'Monday', theme: 'Karbala', image: 'assets/scheduler/monday.jpg', alt: 'Karbala' },
    2: { day: 'Tuesday', theme: 'Najaf', image: 'assets/scheduler/tuesday.jpg', alt: 'Najaf' },
    3: { day: 'Wednesday', theme: 'Kaaba', image: 'assets/scheduler/wednesday.jpg', alt: 'Kaaba Shareef' },
    4: { day: 'Thursday', theme: 'Samarra', image: 'assets/scheduler/thursday.jpg', alt: 'Samarra' },
    5: { day: 'Friday', theme: 'Maqam-e-Sahib uz Zaman', image: 'assets/scheduler/friday.jpg', alt: 'Maqam-e-Sahib uz Zaman' },
    6: { day: 'Saturday', theme: 'Madina', image: 'assets/scheduler/saturday.jpg', alt: 'Madina Shareef' }
  },

  getSchedule() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : this.DEFAULT_IMAGES;
    } catch {
      return this.DEFAULT_IMAGES;
    }
  },

  saveSchedule(schedule) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedule));
  },

  getToday() {
    const today = new Date();
    const dayIndex = today.getDay();
    const schedule = this.getSchedule();
    return {
      ...schedule[dayIndex],
      dayIndex,
      fullDate: today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  },

  updateDayImage(dayIndex, imageData) {
    const schedule = this.getSchedule();
    schedule[dayIndex].image = imageData;
    this.saveSchedule(schedule);
  },

  updateDayTheme(dayIndex, theme) {
    const schedule = this.getSchedule();
    schedule[dayIndex].theme = theme;
    this.saveSchedule(schedule);
  },

  initBanner() {
    const banner = document.getElementById('schedulerBanner');
    if (!banner) return;

    const today = this.getToday();
    const img = banner.querySelector('img');
    const label = banner.querySelector('.scheduler-day-label');
    const theme = banner.querySelector('.scheduler-theme');

    if (img) {
      img.src = today.image;
      img.alt = today.alt;
      img.onerror = () => {
        img.style.display = 'none';
      };
    }
    if (label) label.textContent = `${today.day} Special`;
    if (theme) theme.textContent = today.theme;
  }
};
