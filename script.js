// ── DNS PREFETCH (only for external YouTube embeds now) ──
(function () {
  function addLink(attrs) {
    const l = document.createElement('link');
    Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, v));
    document.head.appendChild(l);
  }
  [
    { rel: 'dns-prefetch', href: 'https://www.youtube.com' },
  ].forEach(addLink);
})();

document.addEventListener('DOMContentLoaded', function () {

  // ── NAV TOGGLE (plain JS, no Bootstrap/jQuery) ──
  (function () {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      const isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  })();

  // ── LAZY BACKGROUNDS ──
  (function () {
    const lazyBgs = document.querySelectorAll('[data-bg]');
    if (!lazyBgs.length) return;
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.backgroundImage = 'url(' + el.dataset.bg + ')';
          observer.unobserve(el);
        }
      });
    }, { rootMargin: '200px' });
    lazyBgs.forEach(function (el) { observer.observe(el); });
  })();

  // ── ACCORDION CLICK-TO-ACTIVATE (About / Photos, for touch devices) ──
  (function () {
    ['about-accordion', 'photo-accordion'].forEach(function (accClass) {
      const acc = document.querySelector('.' + accClass);
      if (!acc) return;
      const panels = acc.querySelectorAll('.about-panel, .photo-panel');
      panels.forEach(function (panel) {
        panel.addEventListener('click', function () {
          const alreadyActive = panel.classList.contains('is-active');
          panels.forEach(function (p) { p.classList.remove('is-active'); });
          acc.classList.remove('has-active');
          if (!alreadyActive) {
            panel.classList.add('is-active');
            acc.classList.add('has-active');
          }
        });
      });
    });
  })();

  // ── LAZY YOUTUBE IFRAME ──
  (function () {
    const iframe = document.getElementById('mainVideoPlayer');
    if (!iframe) return;
    const realSrc = iframe.getAttribute('data-src');
    if (!realSrc) return;

    const observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        iframe.src = realSrc;
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(iframe);
  })();

// ── HERO VIDEO: DELAY LOAD FOR BETTER MOBILE PERFORMANCE ──
(function () {
  function loadHeroVideo() {
    const video = document.getElementById('heroVideo');
    if (!video || video.dataset.loaded === 'true') return;

    const source = document.createElement('source');

    source.src = window.matchMedia('(max-width: 768px)').matches
  ? 'video/hero-background-mobile.mp4'
  : 'video/hero-background.mp4';

    source.type = 'video/mp4';

    video.appendChild(source);
    video.dataset.loaded = 'true';

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

   video.addEventListener('canplay', function () {
  video.classList.add('is-playing');

  const playPromise = video.play();

  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function () {
      // If autoplay is blocked, keep the poster image visible.
    });
  }
}, { once: true });

video.load();

  window.addEventListener('load', function () {
    setTimeout(loadHeroVideo, 800);
  });

  document.addEventListener('visibilitychange', function () {
    const video = document.getElementById('heroVideo');

    if (!document.hidden && video && video.dataset.loaded === 'true' && video.paused) {
      const playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
  });
})();

  // ── MUSIC PLAYER ──
  (function () {
    const TRACKS = [
      { title: 'Broke Not Bent',   tag: 'Studio', dur: '4:37', src: 'audio/broke-not-bent.mp3' },
      { title: 'Turbulence',       tag: 'Studio', dur: '5:17', src: 'audio/turbulence.mp3' },
      { title: 'Looking Down',     tag: 'Studio', dur: '3:31', src: 'audio/looking-down.mp3' },
      { title: 'World We Live In', tag: 'Live',   dur: '4:46', src: 'audio/world-we-live-in.mp3' },
      { title: 'Wine Song',        tag: 'Live',   dur: '6:57', src: 'audio/wine-song.mp3' },
    ];

    const listEl      = document.getElementById('trackList');
    const audio       = document.getElementById('audio');
    if (!listEl || !audio) return;

    const pTitle      = document.getElementById('pTitle');
    const playBtn     = document.getElementById('playBtn');
    const iconPlay    = document.getElementById('iconPlay');
    const iconPause   = document.getElementById('iconPause');
    const progressBar = document.getElementById('progressBar');
    const pCurrent    = document.getElementById('pCurrent');
    const pTotal      = document.getElementById('pTotal');
    const volBar      = document.getElementById('volBar');
    const muteBtn     = document.getElementById('muteBtn');

    let currentIdx = 0, playing = false;

    function buildList() {
      TRACKS.forEach((t, i) => {
        const row = document.createElement('div');
        row.className = 'track-row' + (i === 0 ? ' is-active' : '');
        row.innerHTML = `
          <div class="track-num">
            <span class="t-idx">${String(i + 1).padStart(2, '0')}</span>
            <span class="t-play">&#9654;</span>
          </div>
          <div class="track-name-col">
            <div class="track-name">${t.title}</div>
            <div class="track-tag">${t.tag}</div>
          </div>
          <div class="track-dur">${t.dur}</div>`;
        row.addEventListener('click', () => selectTrack(i, true));
        listEl.appendChild(row);
      });
    }

    function selectTrack(idx, autoplay) {
      document.querySelectorAll('.track-row').forEach((r, i) =>
        r.classList.toggle('is-active', i === idx));
      currentIdx = idx;
      pTitle.textContent = TRACKS[idx].title;
      audio.src = TRACKS[idx].src;
      audio.load();
      if (autoplay) { audio.play(); setPlaying(true); }
    }

    function setPlaying(val) {
      playing = val;
      iconPlay.style.display  = val ? 'none' : '';
      iconPause.style.display = val ? '' : 'none';
    }

    playBtn.addEventListener('click', () => {
      if (!audio.src) {
        audio.src = TRACKS[currentIdx].src;
        audio.load();
        audio.play();
        setPlaying(true);
        return;
      }
      playing ? audio.pause() : audio.play();
      setPlaying(!playing);
    });

    document.getElementById('prevBtn').addEventListener('click', () =>
      selectTrack((currentIdx - 1 + TRACKS.length) % TRACKS.length, playing));
    document.getElementById('nextBtn').addEventListener('click', () =>
      selectTrack((currentIdx + 1) % TRACKS.length, playing));
    audio.addEventListener('ended', () =>
      selectTrack((currentIdx + 1) % TRACKS.length, true));

    function fmt(s) { return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`; }

    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const p = (audio.currentTime / audio.duration) * 100;
      progressBar.value = p;
      progressBar.style.background = `linear-gradient(to right,var(--blue-bright) ${p}%,rgba(255,255,255,0.06) ${p}%)`;
      pCurrent.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', () => { pTotal.textContent = fmt(audio.duration); });
    progressBar.addEventListener('input', () => {
      if (!audio.duration) return;
      audio.currentTime = (progressBar.value / 100) * audio.duration;
      progressBar.style.background = `linear-gradient(to right,var(--blue-bright) ${progressBar.value}%,rgba(255,255,255,0.06) ${progressBar.value}%)`;
    });

    audio.volume = 0.85;
    volBar.addEventListener('input', () => { audio.volume = volBar.value / 100; });
    let muted = false;
    muteBtn.addEventListener('click', () => {
      muted = !muted;
      audio.muted = muted;
      muteBtn.style.color = muted ? 'rgba(74,74,74,0.45)' : '';
    });

    buildList();
    pTitle.textContent = TRACKS[0].title;
  })();

  // ── VIDEO QUEUE ──
  (function () {
    const items = document.querySelectorAll('.video-queue-item');
    const embedWrap = document.querySelector('.video-theater-main .video-embed');
    const title = document.getElementById('theaterTitle');
    if (!items.length || !embedWrap) return;

    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('is-active'));
        item.classList.add('is-active');

        const newFrame = document.createElement('iframe');
        newFrame.src = item.dataset.src + '&autoplay=1';
        newFrame.title = item.dataset.title;
        newFrame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        newFrame.allowFullscreen = true;
        newFrame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;display:block;';

        embedWrap.innerHTML = '';
        embedWrap.appendChild(newFrame);
        title.textContent = item.dataset.title;
      });
    });
  })();

  // ── FOOTER YEAR ──
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

});
