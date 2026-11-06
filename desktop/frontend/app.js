// SoundCloud Ultimate — Desktop Player Engine v1.2
// 100% In-App Experience: Zero External Redirects
(function() {
  'use strict';

  // Helper Utilities
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function formatDurationMs(ms) {
    return formatTime(Math.floor(ms / 1000));
  }

  function formatCount(num) {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  // DOM Elements
  const audio = document.getElementById('audio-engine');
  const tracksGrid = document.getElementById('tracks-grid');
  const searchInput = document.getElementById('search-input');
  const gridTitle = document.getElementById('grid-title');
  const heroSection = document.getElementById('hero-section');
  const heroTitle = document.getElementById('hero-title');
  const heroArtist = document.getElementById('hero-artist');
  const heroBgArt = document.getElementById('hero-bg-art');
  const heroPlayBtn = document.getElementById('hero-play-btn');

  // Player Dock Elements
  const playerArt = document.getElementById('player-art');
  const playerTitle = document.getElementById('player-title');
  const playerArtist = document.getElementById('player-artist');
  const dockLikeBtn = document.getElementById('dock-like-btn');
  const dockCommentsBtn = document.getElementById('dock-comments-btn');
  const dockRadioBtn = document.getElementById('dock-radio-btn');
  const dockDownloadBtn = document.getElementById('dock-download-btn');
  const btnPlay = document.getElementById('btn-play');
  const playIconSvg = document.getElementById('play-icon-svg');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnShuffle = document.getElementById('btn-shuffle');
  const btnRepeat = document.getElementById('btn-repeat');

  const timeCurrent = document.getElementById('time-current');
  const timeTotal = document.getElementById('time-total');
  const progressTrack = document.getElementById('progress-track');
  const progressFill = document.getElementById('progress-fill');
  const progressHandle = document.getElementById('progress-handle');

  // Volume & Queue
  const volumeWrapper = document.getElementById('volume-wrapper');
  const volumePopup = document.getElementById('volume-popup');
  const btnVolume = document.getElementById('btn-volume');
  const volumeIconSvg = document.getElementById('volume-icon-svg');
  const volumeTrack = document.getElementById('volume-track');
  const volumeFill = document.getElementById('volume-fill');
  const volumeKnob = document.getElementById('volume-knob');
  const btnQueueToggle = document.getElementById('btn-queue-toggle');
  const queueDrawer = document.getElementById('queue-drawer');
  const queueList = document.getElementById('queue-list');
  const btnQueueClear = document.getElementById('btn-queue-clear');

  // Auth & Profile
  const btnLoginTrigger = document.getElementById('btn-login-trigger');
  const userBadge = document.getElementById('user-badge');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userDropdown = document.getElementById('user-dropdown');
  const btnViewMyProfile = document.getElementById('btn-view-my-profile');
  const btnLogout = document.getElementById('btn-logout');

  // Library Chips
  const chipLikes = document.getElementById('chip-likes');
  const chipPlaylists = document.getElementById('chip-playlists');
  const chipStream = document.getElementById('chip-stream');
  const chipHistory = document.getElementById('chip-history');

  // Modals — Auth
  const authModalOverlay = document.getElementById('auth-modal-overlay');
  const btnCloseAuthModal = document.getElementById('btn-close-auth-modal');
  const btnImportBrowser = document.getElementById('btn-import-browser');
  const btnOpenScSignin = document.getElementById('btn-open-sc-signin');
  const authTokenInput = document.getElementById('auth-token-input');
  const btnSubmitToken = document.getElementById('btn-submit-token');

  // Modals — Equalizer
  const eqModalOverlay = document.getElementById('eq-modal-overlay');
  const btnEqToggle = document.getElementById('btn-eq-toggle');
  const btnCloseEqModal = document.getElementById('btn-close-eq-modal');
  const eqPresetChips = document.querySelectorAll('.eq-preset-chip');

  // Modals — Fullscreen Vinyl
  const visualizerOverlay = document.getElementById('visualizer-overlay');
  const btnVisToggle = document.getElementById('btn-vis-toggle');
  const btnCloseVis = document.getElementById('btn-close-vis');
  const vinylRecord = document.getElementById('vinyl-record');
  const visArt = document.getElementById('vis-art');
  const visTitle = document.getElementById('vis-title');
  const visArtist = document.getElementById('vis-artist');

  // Modals — In-App Artist Profile
  const profileModalOverlay = document.getElementById('profile-modal-overlay');
  const btnCloseProfileModal = document.getElementById('btn-close-profile-modal');
  const profAvatar = document.getElementById('prof-avatar');
  const profName = document.getElementById('prof-name');
  const profLoc = document.getElementById('prof-loc');
  const profDesc = document.getElementById('prof-desc');
  const profStatTracks = document.getElementById('prof-stat-tracks');
  const profStatFollowers = document.getElementById('prof-stat-followers');
  const profStatLikes = document.getElementById('prof-stat-likes');
  const profFollowBtn = document.getElementById('prof-follow-btn');
  const profTracksGrid = document.getElementById('prof-tracks-grid');
  const profPlaylistsGrid = document.getElementById('prof-playlists-grid');

  // Modals — In-App Playlist Inspector
  const playlistModalOverlay = document.getElementById('playlist-modal-overlay');
  const btnClosePlaylistModal = document.getElementById('btn-close-playlist-modal');
  const plModalArt = document.getElementById('pl-modal-art');
  const plModalTitle = document.getElementById('pl-modal-title');
  const plModalArtist = document.getElementById('pl-modal-artist');
  const plModalMeta = document.getElementById('pl-modal-meta');
  const plModalPlayAll = document.getElementById('pl-modal-play-all');
  const plModalTracksList = document.getElementById('pl-modal-tracks-list');

  // Modals — In-App Comments
  const commentsModalOverlay = document.getElementById('comments-modal-overlay');
  const btnCloseCommentsModal = document.getElementById('btn-close-comments-modal');
  const commentsList = document.getElementById('comments-list');
  const newCommentInput = document.getElementById('new-comment-input');
  const btnSendComment = document.getElementById('btn-send-comment');

  // Global State
  const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="34" height="34" fill="%23FF5500"%3E%3Ccircle cx="17" cy="17" r="17"/%3E%3C/svg%3E';
  const DEFAULT_ART = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23222"%3E%3Crect width="200" height="200"/%3E%3C/svg%3E';

  let queue = [];
  let currentIndex = -1;
  let isPlaying = false;
  let hlsInstance = null;
  let currentVolume = 0.8;
  let isMuted = false;
  let isShuffle = false;
  let repeatMode = 0; // 0: none, 1: all, 2: one
  let searchTimeout = null;
  let currentUser = null;

  let currentViewingArtist = null;
  let currentViewingPlaylist = null;
  let currentViewingTrackForComments = null;

  // WebAudio Equalizer State
  let audioCtx = null;
  let audioSource = null;
  let eqFilters = [];
  const EQ_FREQS = [60, 250, 1000, 4000, 12000];

  // SVG Icons
  const SVG_PLAY = '<path d="M8 5v14l11-7z"/>';
  const SVG_PAUSE = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  const SVG_VOL_HIGH = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
  const SVG_VOL_MUTED = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';

  // 1. Equalizer WebAudio Initialization
  function initEqualizer() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      audioSource = audioCtx.createMediaElementSource(audio);

      eqFilters = EQ_FREQS.map((freq, i) => {
        const filter = audioCtx.createBiquadFilter();
        if (i === 0) {
          filter.type = 'lowshelf';
        } else if (i === EQ_FREQS.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.0;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });

      let node = audioSource;
      for (const filter of eqFilters) {
        node.connect(filter);
        node = filter;
      }
      if (audioCtx.createStereoPanner) {
        stereoPanner = audioCtx.createStereoPanner();
        node.connect(stereoPanner);
        stereoPanner.connect(audioCtx.destination);
      } else {
        node.connect(audioCtx.destination);
      }
    } catch (e) {
      console.warn('WebAudio Equalizer not initialized:', e);
    }
  }

  function setEqGain(bandIdx, gain) {
    initEqualizer();
    if (eqFilters[bandIdx]) {
      eqFilters[bandIdx].gain.value = gain;
    }
    const valEl = document.getElementById(`eq-val-${bandIdx}`);
    if (valEl) {
      valEl.textContent = `${gain > 0 ? '+' : ''}${gain}dB`;
    }
  }

  const PRESETS = {
    flat: [0, 0, 0, 0, 0],
    bass: [7, 5, 0, 0, 0],
    electronic: [5, 3, -1, 3, 5],
    vocal: [-2, 0, 4, 3, 0],
    rock: [4, 2, -1, 3, 4]
  };

  function applyEqPreset(presetName) {
    const vals = PRESETS[presetName] || PRESETS.flat;
    vals.forEach((val, i) => {
      const slider = document.getElementById(`eq-band-${i}`);
      if (slider) slider.value = val;
      setEqGain(i, val);
    });
  }

  EQ_FREQS.forEach((_, i) => {
    const slider = document.getElementById(`eq-band-${i}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        setEqGain(i, parseFloat(e.target.value));
        eqPresetChips.forEach(c => c.classList.remove('active'));
      });
    }
  });

  eqPresetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      eqPresetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyEqPreset(chip.getAttribute('data-preset'));
    });
  });

  // 2. Audio Engine & Playback
  async function playTrack(track, index = -1) {
    if (!track) return;
    initEqualizer();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (index >= 0) {
      currentIndex = index;
    } else {
      const existingIdx = queue.findIndex(t => t.id === track.id);
      if (existingIdx >= 0) {
        currentIndex = existingIdx;
      } else {
        queue.push(track);
        currentIndex = queue.length - 1;
      }
    }

    renderQueue();

    // Update Dock
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    const art = track.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="%23222"%3E%3Crect width="48" height="48"/%3E%3C/svg%3E';
    playerArt.src = art;
    visArt.src = art;
    visTitle.textContent = track.title;
    visArtist.textContent = track.artist;
    document.title = `🎵 ${track.title} • ${track.artist} | SoundCloud`;

    dockLikeBtn.classList.toggle('liked', !!track.liked);

    try {
      playerTitle.textContent = `Loading: ${track.title}...`;
      const res = await fetch(`/api/stream?id=${track.id}`);
      if (!res.ok) throw new Error('Stream resolution failed');
      const data = await res.json();
      playerTitle.textContent = track.title;

      const streamUrl = data.stream_url;
      const protocol = data.protocol;

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (protocol === 'hls' || streamUrl.includes('.m3u8')) {
        if (window.Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(audio);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.play().catch(e => console.warn('Play interrupted:', e));
          });
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          audio.src = streamUrl;
          audio.play().catch(e => console.warn('Play interrupted:', e));
        } else {
          audio.src = streamUrl;
          audio.play();
        }
      } else {
        audio.src = streamUrl;
        audio.play().catch(e => console.warn('Play interrupted:', e));
      }

      isPlaying = true;
      updatePlayButtonUI(true);
      setupMediaSession(track);
      syncDiscordRPC(track, true);
    } catch (err) {
      console.error('Audio playback error:', err);
      playerTitle.textContent = `Playback error: ${track.title}`;
    }
  }

  function togglePlayPause() {
    if (currentIndex < 0 && queue.length > 0) {
      playTrack(queue[0], 0);
      return;
    }
    if (!audio.src && (!hlsInstance || !hlsInstance.media)) return;

    if (audio.paused) {
      audio.play().then(() => {
        isPlaying = true;
        updatePlayButtonUI(true);
        if (currentIndex >= 0 && queue[currentIndex]) {
          syncDiscordRPC(queue[currentIndex], true);
        }
      });
    } else {
      audio.pause();
      isPlaying = false;
      updatePlayButtonUI(false);
      if (currentIndex >= 0 && queue[currentIndex]) {
        syncDiscordRPC(queue[currentIndex], false);
      }
    }
  }

  function updatePlayButtonUI(playing) {
    if (playing) {
      playIconSvg.innerHTML = SVG_PAUSE;
      playIconSvg.classList.remove('play-triangle');
      vinylRecord.classList.add('spinning');
    } else {
      playIconSvg.innerHTML = SVG_PLAY;
      playIconSvg.classList.add('play-triangle');
      vinylRecord.classList.remove('spinning');
    }
  }

  function playNext() {
    if (queue.length === 0) return;
    if (isShuffle) {
      currentIndex = Math.floor(Math.random() * queue.length);
    } else {
      currentIndex = (currentIndex + 1) % queue.length;
    }
    playTrack(queue[currentIndex], currentIndex);
  }

  function playPrev() {
    if (queue.length === 0) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (isShuffle) {
      currentIndex = Math.floor(Math.random() * queue.length);
    } else {
      currentIndex = (currentIndex - 1 + queue.length) % queue.length;
    }
    playTrack(queue[currentIndex], currentIndex);
  }

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const current = audio.currentTime;
    const duration = audio.duration;
    timeCurrent.textContent = formatTime(current);
    timeTotal.textContent = formatTime(duration);

    const percent = (current / duration) * 100;
    progressFill.style.width = `${percent}%`;
    progressHandle.style.left = `${percent}%`;

    // Hook: A-B Looper
    checkLooper(current);

    // Hook: Synced Lyrics Karaoke
    updateLyricsSync(current);
  });

  audio.addEventListener('ended', () => {
    if (sleepTargetType === 'track') {
      cancelSleepTimer();
      audio.pause();
      isPlaying = false;
      updatePlayButtonUI(false);
      showToast('🌙 Sleep timer: track finished, music stopped');
      return;
    }

    if (repeatMode === 2) {
      audio.currentTime = 0;
      audio.play();
    } else if (repeatMode === 1 || currentIndex < queue.length - 1) {
      playNext();
    } else {
      isPlaying = false;
      updatePlayButtonUI(false);
      clearDiscordRPC();
    }
  });

  audio.addEventListener('play', () => {
    isPlaying = true;
    updatePlayButtonUI(true);
    if (currentIndex >= 0 && queue[currentIndex]) {
      syncDiscordRPC(queue[currentIndex], true);
    }
  });

  audio.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayButtonUI(false);
    if (currentIndex >= 0 && queue[currentIndex]) {
      syncDiscordRPC(queue[currentIndex], false);
    }
  });

  // Timeline Scrubber
  function seekFromEvent(e) {
    const rect = progressTrack.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audio.duration) {
      audio.currentTime = pos * audio.duration;
    }
  }

  let isSeeking = false;
  progressTrack.addEventListener('mousedown', (e) => {
    isSeeking = true;
    seekFromEvent(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isSeeking) seekFromEvent(e);
  });

  window.addEventListener('mouseup', () => {
    if (isSeeking) {
      isSeeking = false;
      if (currentIndex >= 0 && queue[currentIndex]) {
        syncDiscordRPC(queue[currentIndex], !audio.paused);
      }
    }
  });

  // Volume Slider & Popup Controls
  let volumeHideTimeout = null;

  function showVolumePopup() {
    clearTimeout(volumeHideTimeout);
    if (volumePopup) volumePopup.classList.add('active');
  }

  function hideVolumePopup(delay = 350) {
    if (isVolDragging) return;
    clearTimeout(volumeHideTimeout);
    volumeHideTimeout = setTimeout(() => {
      if (!isVolDragging && volumePopup) {
        volumePopup.classList.remove('active');
      }
    }, delay);
  }

  function setVolume(val, updateAudio = true) {
    currentVolume = Math.max(0, Math.min(1, val));
    if (updateAudio) {
      audio.volume = isMuted ? 0 : currentVolume;
    }
    const percent = currentVolume * 100;
    volumeFill.style.height = `${percent}%`;
    volumeKnob.style.bottom = `${percent}%`;

    if (isMuted || currentVolume === 0) {
      volumeIconSvg.innerHTML = SVG_VOL_MUTED;
    } else {
      volumeIconSvg.innerHTML = SVG_VOL_HIGH;
    }
  }

  function setVolumeFromEvent(e) {
    const rect = volumeTrack.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (rect.bottom - e.clientY) / rect.height));
    isMuted = false;
    setVolume(pos);
  }

  let isVolDragging = false;

  if (volumeWrapper) {
    volumeWrapper.addEventListener('mouseenter', showVolumePopup);
    volumeWrapper.addEventListener('mouseleave', () => hideVolumePopup(350));
    volumeWrapper.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      setVolume(currentVolume + delta);
      showVolumePopup();
      hideVolumePopup(1200);
    }, { passive: false });
  }

  if (volumePopup) {
    volumePopup.addEventListener('mouseenter', showVolumePopup);
    volumePopup.addEventListener('mouseleave', () => hideVolumePopup(350));
    volumePopup.addEventListener('mousedown', (e) => {
      isVolDragging = true;
      showVolumePopup();
      setVolumeFromEvent(e);
    });
  }

  volumeTrack.addEventListener('mousedown', (e) => {
    isVolDragging = true;
    showVolumePopup();
    setVolumeFromEvent(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isVolDragging) {
      showVolumePopup();
      setVolumeFromEvent(e);
    }
  });

  window.addEventListener('mouseup', () => {
    if (isVolDragging) {
      isVolDragging = false;
      hideVolumePopup(400);
    }
  });

  btnVolume.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
      audio.volume = 0;
      volumeIconSvg.innerHTML = SVG_VOL_MUTED;
    } else {
      audio.volume = currentVolume;
      setVolume(currentVolume);
    }
    showVolumePopup();
    hideVolumePopup(1200);
  });

  // Controls
  btnPlay.addEventListener('click', togglePlayPause);
  btnNext.addEventListener('click', playNext);
  btnPrev.addEventListener('click', playPrev);

  btnShuffle.addEventListener('click', () => {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle('active', isShuffle);
  });

  btnRepeat.addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    btnRepeat.classList.toggle('active', repeatMode > 0);
    if (repeatMode === 2) {
      btnRepeat.title = 'Repeat one track';
      btnRepeat.style.color = '#FFAA00';
    } else if (repeatMode === 1) {
      btnRepeat.title = 'Repeat entire queue';
      btnRepeat.style.color = 'var(--orange-neon)';
    } else {
      btnRepeat.title = 'Repeat (R)';
      btnRepeat.style.color = '';
    }
  });

  // Queue Drawer
  btnQueueToggle.addEventListener('click', () => {
    queueDrawer.classList.toggle('open');
    btnQueueToggle.classList.toggle('active', queueDrawer.classList.contains('open'));
  });

  btnQueueClear.addEventListener('click', () => {
    queue = currentIndex >= 0 ? [queue[currentIndex]] : [];
    currentIndex = queue.length > 0 ? 0 : -1;
    renderQueue();
  });

  function renderQueue() {
    queueList.innerHTML = '';
    if (queue.length === 0) {
      queueList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 20px; font-size: 13px;">Queue is empty</div>';
      return;
    }

    queue.forEach((t, idx) => {
      const item = document.createElement('div');
      item.className = `queue-item ${idx === currentIndex ? 'active' : ''}`;
      item.innerHTML = `
        <img class="queue-item-art" src="${t.artwork_url || ''}" alt="">
        <div class="queue-item-info">
          <div class="queue-item-title">${t.title}</div>
          <div class="queue-item-artist">${t.artist}</div>
        </div>
        <span style="font-size: 11px; color: var(--text-dim);">${formatDurationMs(t.duration_ms)}</span>
      `;
      item.addEventListener('click', () => playTrack(t, idx));
      queueList.appendChild(item);
    });
  }

  // 3. Like & Download Actions
  async function toggleTrackLike(track, btnEl = null) {
    if (!currentUser) {
      authModalOverlay.classList.add('open');
      return;
    }
    const willLike = !track.liked;
    track.liked = willLike;

    if (btnEl) btnEl.classList.toggle('liked', willLike);
    if (currentIndex >= 0 && queue[currentIndex] && queue[currentIndex].id === track.id) {
      dockLikeBtn.classList.toggle('liked', willLike);
    }

    try {
      const method = willLike ? 'POST' : 'DELETE';
      await fetch(`/api/tracks/${track.id}/like`, { method });
    } catch (e) {
      console.warn('Like toggle failed:', e);
    }
  }

  dockLikeBtn.addEventListener('click', () => {
    if (currentIndex >= 0 && queue[currentIndex]) {
      toggleTrackLike(queue[currentIndex], dockLikeBtn);
    }
  });

  dockDownloadBtn.addEventListener('click', () => {
    if (currentIndex >= 0 && queue[currentIndex]) {
      const track = queue[currentIndex];
      window.location.href = `/api/download?id=${track.id}`;
    }
  });

  // 4. Equalizer & Visualizer Toggles
  btnEqToggle.addEventListener('click', () => {
    eqModalOverlay.classList.toggle('open');
  });

  btnCloseEqModal.addEventListener('click', () => {
    eqModalOverlay.classList.remove('open');
  });

  btnVisToggle.addEventListener('click', () => {
    visualizerOverlay.classList.toggle('open');
  });

  btnCloseVis.addEventListener('click', () => {
    visualizerOverlay.classList.remove('open');
  });

  // 5. In-App Artist Profile Modal (100% In-App)
  async function openArtistProfile(artistId) {
    if (!artistId) return;
    profileModalOverlay.classList.add('open');

    // Loading skeleton
    profName.textContent = 'Loading profile...';
    profLoc.textContent = '';
    profDesc.textContent = '';
    profStatTracks.textContent = '...';
    profStatFollowers.textContent = '...';
    profStatLikes.textContent = '...';
    profTracksGrid.innerHTML = '<div style="color: var(--text-dim); padding: 20px;">Loading tracks...</div>';
    profPlaylistsGrid.innerHTML = '';
    profFollowBtn.style.display = 'none';

    try {
      const res = await fetch(`/api/artists/${artistId}`);
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      currentViewingArtist = data;

      profName.textContent = data.username;
      profAvatar.src = data.avatar_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23FF5500"%3E%3Ccircle cx="50" cy="50" r="50"/%3E%3C/svg%3E';
      const locParts = [data.city, data.country].filter(Boolean);
      profLoc.textContent = locParts.length > 0 ? `📍 ${locParts.join(', ')}` : '📍 SoundCloud Universe';
      profDesc.textContent = data.description || 'Artist has not added a bio yet.';

      profStatTracks.textContent = formatCount(data.track_count);
      profStatFollowers.textContent = formatCount(data.followers_count);
      profStatLikes.textContent = formatCount(data.likes_count);

      // Follow Button State
      if (currentUser && currentUser.id === data.id) {
        profFollowBtn.style.display = 'none';
      } else {
        profFollowBtn.style.display = 'block';
        updateFollowBtnUI(!!data.is_following);
      }

      // Render Artist Tracks
      profTracksGrid.innerHTML = '';
      if (!data.tracks || data.tracks.length === 0) {
        profTracksGrid.innerHTML = '<div style="color: var(--text-dim); padding: 20px;">No uploaded tracks</div>';
      } else {
        data.tracks.forEach((t, i) => {
          const card = document.createElement('div');
          card.className = 'track-card';
          const art = t.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="%23222"%3E%3Crect width="160" height="160"/%3E%3C/svg%3E';
          card.innerHTML = `
            <div class="artwork-wrapper">
              <img class="track-artwork" src="${art}" loading="lazy" alt="${t.title}">
              <div class="card-play-overlay">
                <button class="overlay-play-btn" title="Play">
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            </div>
            <div class="track-title" title="${t.title}">${t.title}</div>
            <div class="track-artist" title="${t.artist}">${t.artist}</div>
            <div class="track-meta">
              <span>⏱ ${formatDurationMs(t.duration_ms)}</span>
              <button class="like-btn ${t.liked ? 'liked' : ''}" title="Like">
                <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
            </div>
          `;
          card.addEventListener('click', (e) => {
            if (e.target.closest('.like-btn')) {
              e.stopPropagation();
              toggleTrackLike(t, card.querySelector('.like-btn'));
              return;
            }
            queue = data.tracks.slice();
            playTrack(t, i);
          });
          profTracksGrid.appendChild(card);
        });
      }

      // Render Artist Playlists
      profPlaylistsGrid.innerHTML = '';
      if (!data.playlists || data.playlists.length === 0) {
        profPlaylistsGrid.innerHTML = '<div style="color: var(--text-dim); padding: 10px; font-size: 13px;">No public albums</div>';
      } else {
        data.playlists.forEach(pl => {
          const card = document.createElement('div');
          card.className = 'playlist-card';
          const art = pl.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160" fill="%23222"%3E%3Crect width="160" height="160"/%3E%3C/svg%3E';
          card.innerHTML = `
            <div class="artwork-wrapper" style="position: relative;">
              <img class="track-artwork" src="${art}" loading="lazy" alt="${pl.title}">
              <div class="playlist-badge">📂 ${pl.track_count} tracks</div>
            </div>
            <div class="track-title" title="${pl.title}">${pl.title}</div>
            <div class="track-artist" title="${pl.artist}">${pl.artist}</div>
          `;
          card.addEventListener('click', () => {
            openPlaylistInspector(pl.id);
          });
          profPlaylistsGrid.appendChild(card);
        });
      }

    } catch (e) {
      console.error('Failed to load artist profile:', e);
      profName.textContent = 'Error loading profile';
      profDesc.textContent = e.toString();
    }
  }

  function updateFollowBtnUI(following) {
    if (following) {
      profFollowBtn.textContent = '✓ Following';
      profFollowBtn.classList.add('following');
    } else {
      profFollowBtn.textContent = '+ Follow';
      profFollowBtn.classList.remove('following');
    }
  }

  profFollowBtn.addEventListener('click', async () => {
    if (!currentUser) {
      authModalOverlay.classList.add('open');
      return;
    }
    if (!currentViewingArtist) return;

    const willFollow = !currentViewingArtist.is_following;
    updateFollowBtnUI(willFollow);
    currentViewingArtist.is_following = willFollow;

    try {
      const method = willFollow ? 'POST' : 'DELETE';
      await fetch(`/api/artists/${currentViewingArtist.id}/follow`, { method });
    } catch (e) {
      console.error('Follow toggle error:', e);
    }
  });

  btnCloseProfileModal.addEventListener('click', () => {
    profileModalOverlay.classList.remove('open');
  });

  // 6. In-App Playlist & Album Inspector Modal (100% In-App)
  async function openPlaylistInspector(playlistId) {
    if (!playlistId) return;
    playlistModalOverlay.classList.add('open');

    // Loading skeleton
    plModalTitle.textContent = 'Loading playlist...';
    plModalArtist.textContent = '';
    plModalMeta.textContent = '...';
    plModalTracksList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 30px;">Loading tracks...</div>';

    try {
      const res = await fetch(`/api/playlists/${playlistId}`);
      if (!res.ok) throw new Error('Playlist load failed');
      const data = await res.json();
      currentViewingPlaylist = data;

      plModalTitle.textContent = data.title;
      plModalArtist.textContent = data.artist;
      plModalArt.src = data.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="130" height="130" fill="%23222"%3E%3Crect width="130" height="130"/%3E%3C/svg%3E';
      const trackCount = data.tracks ? data.tracks.length : data.track_count;
      plModalMeta.textContent = `${trackCount} tracks • ${formatDurationMs(data.duration_ms)}`;

      // Click artist in playlist modal
      plModalArtist.onclick = () => {
        if (data.artist_id) {
          playlistModalOverlay.classList.remove('open');
          openArtistProfile(data.artist_id);
        }
      };

      // Play All Button
      plModalPlayAll.onclick = () => {
        if (data.tracks && data.tracks.length > 0) {
          queue = data.tracks.slice();
          playTrack(queue[0], 0);
        }
      };

      // Render Tracks List
      plModalTracksList.innerHTML = '';
      if (!data.tracks || data.tracks.length === 0) {
        plModalTracksList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 20px;">No available tracks in this playlist</div>';
        return;
      }

      data.tracks.forEach((t, i) => {
        const row = document.createElement('div');
        row.className = 'playlist-track-row';
        row.innerHTML = `
          <span class="playlist-track-num">${i + 1}</span>
          <span class="playlist-track-title" title="${t.title}">${t.title}</span>
          <span class="playlist-track-artist" title="${t.artist}">${t.artist}</span>
          <span class="playlist-track-duration">${formatDurationMs(t.duration_ms)}</span>
        `;
        row.onclick = () => {
          queue = data.tracks.slice();
          playTrack(t, i);
        };
        plModalTracksList.appendChild(row);
      });

    } catch (e) {
      console.error('Failed to load playlist:', e);
      plModalTitle.textContent = 'Error loading playlist';
      plModalTracksList.innerHTML = `<div style="color: #FF5555; text-align: center; padding: 20px;">${e.toString()}</div>`;
    }
  }

  btnClosePlaylistModal.addEventListener('click', () => {
    playlistModalOverlay.classList.remove('open');
  });

  // 7. In-App Track Comments Modal (100% In-App)
  async function openCommentsModal(track = null) {
    if (!track) {
      track = currentIndex >= 0 ? queue[currentIndex] : null;
    }
    if (!track) {
      alert('Please play a track first to view comments');
      return;
    }

    currentViewingTrackForComments = track;
    commentsModalOverlay.classList.add('open');
    commentsList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 30px;">Loading comments...</div>';

    try {
      const res = await fetch(`/api/tracks/${track.id}/comments`);
      if (!res.ok) throw new Error('Comments load failed');
      const data = await res.json();
      renderCommentsList(data.comments || []);
    } catch (e) {
      console.error('Failed to load comments:', e);
      commentsList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 30px;">Could not load comments for this track</div>';
    }
  }

  function renderCommentsList(comments) {
    commentsList.innerHTML = '';
    if (!comments || comments.length === 0) {
      commentsList.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 30px;">No comments yet on this track. Be the first!</div>';
      return;
    }

    comments.forEach(c => {
      const row = document.createElement('div');
      row.className = 'comment-row';
      const timeStr = c.timestamp_ms ? formatDurationMs(c.timestamp_ms) : '';

      row.innerHTML = `
        <img class="comment-avatar" src="${c.user_avatar || DEFAULT_AVATAR}" alt="">
        <div class="comment-content">
          <div class="comment-user-row">
            <span class="comment-username" style="cursor: pointer;">${escapeHtml(c.username)}</span>
            ${timeStr ? `<span class="comment-timestamp-chip" data-time="${c.timestamp_ms / 1000}">⏱ ${timeStr}</span>` : ''}
          </div>
          <div class="comment-body">${escapeHtml(c.body)}</div>
        </div>
      `;

      // Click username opens profile
      const userEl = row.querySelector('.comment-username');
      if (userEl && c.user_id) {
        userEl.onclick = () => {
          commentsModalOverlay.classList.remove('open');
          openArtistProfile(c.user_id);
        };
      }

      // Click timestamp seeks audio
      const chip = row.querySelector('.comment-timestamp-chip');
      if (chip) {
        chip.onclick = () => {
          const t = parseFloat(chip.getAttribute('data-time'));
          audio.currentTime = t;
          if (audio.paused) audio.play();
        };
      }

      commentsList.appendChild(row);
    });
  }

  async function postNewComment() {
    if (!currentUser) {
      authModalOverlay.classList.add('open');
      return;
    }
    if (!currentViewingTrackForComments) return;

    const body = newCommentInput.value.trim();
    if (!body) return;

    const timestamp_ms = Math.floor((audio.currentTime || 0) * 1000);
    btnSendComment.textContent = 'Sending...';
    btnSendComment.disabled = true;

    try {
      const res = await fetch(`/api/tracks/${currentViewingTrackForComments.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, timestamp_ms })
      });
      if (!res.ok) throw new Error('Comment post failed');
      const newComment = await res.json();
      newCommentInput.value = '';

      // Insert immediately into list
      const row = document.createElement('div');
      row.className = 'comment-row';
      const timeStr = newComment.timestamp_ms ? formatDurationMs(newComment.timestamp_ms) : '';
      row.innerHTML = `
        <img class="comment-avatar" src="${newComment.user_avatar || currentUser.avatar_url || ''}" alt="">
        <div class="comment-content">
          <div class="comment-user-row">
            <span class="comment-username">${escapeHtml(newComment.username)}</span>
            ${timeStr ? `<span class="comment-timestamp-chip">⏱ ${timeStr}</span>` : ''}
          </div>
          <div class="comment-body">${escapeHtml(newComment.body)}</div>
        </div>
      `;
      commentsList.insertBefore(row, commentsList.firstChild);
    } catch (e) {
      alert('Error sending comment: ' + e);
    } finally {
      btnSendComment.textContent = 'Send';
      btnSendComment.disabled = false;
    }
  }

  btnSendComment.addEventListener('click', postNewComment);
  newCommentInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') postNewComment();
  });
  btnCloseCommentsModal.addEventListener('click', () => {
    commentsModalOverlay.classList.remove('open');
  });

  dockCommentsBtn.addEventListener('click', () => {
    openCommentsModal();
  });

  // 8. In-App Track Radio / Station (100% In-App)
  async function startTrackRadio() {
    if (currentIndex < 0 || !queue[currentIndex]) {
      alert('Please play a track first to start a radio station');
      return;
    }
    const track = queue[currentIndex];
    playerTitle.textContent = `Starting radio: ${track.title}...`;

    try {
      const res = await fetch(`/api/tracks/${track.id}/related`);
      if (!res.ok) throw new Error('Failed to load radio tracks');
      const data = await res.json();

      if (data.tracks && data.tracks.length > 0) {
        queue = [track, ...data.tracks];
        currentIndex = 0;
        renderQueue();
        gridTitle.innerHTML = `📻 Radio Station: <span>"${track.title}"</span> (${data.tracks.length} tracks)`;
        heroSection.style.display = 'none';
        renderTracks(queue);
        playerTitle.textContent = track.title;
      } else {
        alert('No similar tracks found');
        playerTitle.textContent = track.title;
      }
    } catch (e) {
      console.error('Radio error:', e);
      playerTitle.textContent = track.title;
    }
  }

  dockRadioBtn.addEventListener('click', startTrackRadio);

  // Click artist name in player dock
  playerArtist.addEventListener('click', () => {
    if (currentIndex >= 0 && queue[currentIndex] && queue[currentIndex].artist_id) {
      openArtistProfile(queue[currentIndex].artist_id);
    }
  });

  // 9. Authentication & User Profile
  async function checkSystemStatus() {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      const badge = document.getElementById('antidpi-badge');
      if (badge && data.antidpi) {
        badge.title = `⚡ Zapret: ${data.antidpi}\nISP/DPI bypass active. Music and API work without external VPN.`;
      }
    } catch (e) {
      console.warn('System status check failed:', e);
    }
  }

  async function checkAuthStatus() {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      if (data.authenticated && data.user) {
        currentUser = data.user;
        btnLoginTrigger.style.display = 'none';
        userBadge.style.display = 'flex';
        userName.textContent = currentUser.username;
        userAvatar.src = currentUser.avatar_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="%23FF5500"%3E%3Ccircle cx="16" cy="16" r="16"/%3E%3C/svg%3E';

        // Reveal library tabs
        chipLikes.style.display = 'block';
        chipPlaylists.style.display = 'block';
        chipStream.style.display = 'block';
        chipHistory.style.display = 'block';
      } else {
        currentUser = null;
        btnLoginTrigger.style.display = 'flex';
        userBadge.style.display = 'none';
        chipLikes.style.display = 'none';
        chipPlaylists.style.display = 'none';
        chipStream.style.display = 'none';
        chipHistory.style.display = 'none';
      }
    } catch (e) {
      console.warn('Auth status check failed:', e);
    }
  }

  btnLoginTrigger.addEventListener('click', () => {
    authModalOverlay.classList.add('open');
  });

  btnCloseAuthModal.addEventListener('click', () => {
    authModalOverlay.classList.remove('open');
  });

  if (btnImportBrowser) {
    btnImportBrowser.addEventListener('click', async () => {
      btnImportBrowser.textContent = 'Scanning Chromium session...';
      try {
        const res = await fetch('/api/auth/import-browser', { method: 'POST' });
        const data = await res.json();
        if (data.authenticated) {
          authModalOverlay.classList.remove('open');
          await checkAuthStatus();
          loadMyLikes();
        } else {
          alert('Session not found: ' + (data.error || 'sign in to soundcloud.com in Chromium / Chrome'));
        }
      } catch(e) {
        alert('Import error: ' + e);
      } finally {
        btnImportBrowser.textContent = '⚡ 1-Click Sign In (from Chromium)';
      }
    });
  }

  btnOpenScSignin.addEventListener('click', () => {
    window.open('https://soundcloud.com/signin', '_blank');
  });

  btnSubmitToken.addEventListener('click', async () => {
    const token = authTokenInput.value.trim();
    if (!token) return;

    btnSubmitToken.textContent = 'Verifying...';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (data.authenticated) {
        authModalOverlay.classList.remove('open');
        await checkAuthStatus();
        loadMyLikes();
      } else {
        alert(data.error || 'Invalid token. Please check and try again.');
      }
    } catch (e) {
      alert('Connection error: ' + e);
    } finally {
      btnSubmitToken.textContent = 'Connect Account';
    }
  });

  userBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('open');
  });

  window.addEventListener('click', () => {
    userDropdown.classList.remove('open');
  });

  if (btnViewMyProfile) {
    btnViewMyProfile.addEventListener('click', () => {
      if (currentUser && currentUser.id) {
        userDropdown.classList.remove('open');
        openArtistProfile(currentUser.id);
      }
    });
  }

  btnLogout.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    checkAuthStatus();
    loadTrending('all-music');
  });

  // 10. Bento Grid Rendering (Tracks & Playlists)
  function renderTracks(tracks) {
    tracksGrid.innerHTML = '';
    if (!tracks || tracks.length === 0) {
      tracksGrid.innerHTML = '<div style="color: var(--text-dim); padding: 40px; font-size: 14px;">No tracks found</div>';
      return;
    }

    if (tracks.length > 0 && heroSection.style.display !== 'none') {
      const first = tracks[0];
      heroTitle.textContent = first.title;
      heroArtist.textContent = first.artist;
      if (first.artwork_url) {
        heroBgArt.src = first.artwork_url;
      }
      heroPlayBtn.onclick = () => playTrack(first, 0);
    }

    tracks.forEach((track, idx) => {
      const card = document.createElement('div');
      card.className = 'track-card';
      const art = track.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23222"%3E%3Crect width="200" height="200"/%3E%3C/svg%3E';

      card.innerHTML = `
        <div class="artwork-wrapper">
          <img class="track-artwork" src="${art}" loading="lazy" alt="${track.title}">
          <div class="card-play-overlay">
            <button class="overlay-play-btn" title="Play">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        </div>
        <div class="track-title" title="${track.title}">${track.title}</div>
        <div class="track-artist" title="${track.artist}" style="cursor: pointer;">${track.artist}</div>
        <div class="track-meta">
          <span>⏱ ${formatDurationMs(track.duration_ms)}</span>
          <button class="like-btn ${track.liked ? 'liked' : ''}" title="Like">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn')) {
          e.stopPropagation();
          toggleTrackLike(track, card.querySelector('.like-btn'));
          return;
        }
        if (e.target.closest('.track-artist')) {
          e.stopPropagation();
          if (track.artist_id) {
            openArtistProfile(track.artist_id);
          } else {
            performSearch(track.artist);
          }
          return;
        }
        queue = tracks.slice();
        playTrack(track, idx);
      });

      tracksGrid.appendChild(card);
    });
  }

  function renderPlaylists(playlists) {
    tracksGrid.innerHTML = '';
    if (!playlists || playlists.length === 0) {
      tracksGrid.innerHTML = '<div style="color: var(--text-dim); padding: 40px; font-size: 14px;">No playlists found</div>';
      return;
    }

    playlists.forEach(pl => {
      const card = document.createElement('div');
      card.className = 'playlist-card';
      const art = pl.artwork_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23222"%3E%3Crect width="200" height="200"/%3E%3C/svg%3E';

      card.innerHTML = `
        <div class="artwork-wrapper" style="position: relative;">
          <img class="track-artwork" src="${art}" loading="lazy" alt="${pl.title}">
          <div class="playlist-badge">📂 ${pl.track_count} tracks</div>
        </div>
        <div class="track-title" title="${pl.title}">${pl.title}</div>
        <div class="track-artist" title="${pl.artist}">${pl.artist}</div>
      `;

      card.addEventListener('click', () => {
        openPlaylistInspector(pl.id);
      });

      tracksGrid.appendChild(card);
    });
  }

  // 11. Library Navigation Calls
  async function loadMyLikes() {
    gridTitle.innerHTML = '❤️ Liked Tracks <span>•</span> Library';
    heroSection.style.display = 'none';
    try {
      const res = await fetch('/api/me/likes?limit=50');
      const data = await res.json();
      renderTracks(data.tracks || []);
    } catch (e) {
      console.error('Failed to load likes:', e);
    }
  }

  async function loadMyPlaylists() {
    gridTitle.innerHTML = '📂 Playlists <span>•</span> Library';
    heroSection.style.display = 'none';
    try {
      const res = await fetch('/api/me/playlists');
      const data = await res.json();
      renderPlaylists(data.playlists || []);
    } catch (e) {
      console.error('Failed to load playlists:', e);
    }
  }

  async function loadMyStream() {
    gridTitle.innerHTML = '📡 Personal Stream <span>•</span> Following';
    heroSection.style.display = 'none';
    try {
      const res = await fetch('/api/me/stream');
      const data = await res.json();
      renderTracks(data.tracks || []);
    } catch (e) {
      console.error('Failed to load stream:', e);
    }
  }

  async function loadMyHistory() {
    gridTitle.innerHTML = '🕒 Listening History <span>•</span> History';
    heroSection.style.display = 'none';
    try {
      const res = await fetch('/api/me/history');
      const data = await res.json();
      renderTracks(data.tracks || []);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }

  async function loadTrending(genre = 'all-music') {
    gridTitle.innerHTML = `Trending: <span>${genre.toUpperCase()}</span>`;
    heroSection.style.display = 'grid';
    try {
      const res = await fetch(`/api/trending?genre=${genre}&limit=32`);
      const data = await res.json();
      renderTracks(data.tracks || []);
    } catch (e) {
      console.error('Failed to load trending:', e);
    }
  }

  async function performSearch(query) {
    if (!query || !query.trim()) {
      loadTrending();
      return;
    }
    gridTitle.innerHTML = `Search Results: <span>"${query}"</span>`;
    heroSection.style.display = 'none';

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=32`);
      const data = await res.json();
      renderTracks(data.tracks || []);
    } catch (e) {
      console.error('Failed to search tracks:', e);
    }
  }

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const q = e.target.value.trim();
    searchTimeout = setTimeout(() => {
      performSearch(q);
    }, 350);
  });

  // Chips Bar Click
  document.getElementById('chips-bar').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    searchInput.value = '';

    const type = chip.getAttribute('data-type');
    const val = chip.getAttribute('data-val');

    if (type === 'lib') {
      if (val === 'likes') loadMyLikes();
      else if (val === 'playlists') loadMyPlaylists();
      else if (val === 'stream') loadMyStream();
      else if (val === 'history') loadMyHistory();
    } else {
      loadTrending(val);
    }
  });

  document.getElementById('brand-home').addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    document.querySelector('.chip').classList.add('active');
    searchInput.value = '';
    loadTrending('all-music');
  });

  // Overlay click to close
  [authModalOverlay, eqModalOverlay, profileModalOverlay, playlistModalOverlay, commentsModalOverlay].forEach(overlay => {
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    }
  });

  // 12. MediaSession API
  function setupMediaSession(track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: 'SoundCloud',
        artwork: track.artwork_url ? [{ src: track.artwork_url, sizes: '500x500', type: 'image/jpeg' }] : []
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && audio.duration) {
          audio.currentTime = details.seekTime;
        }
      });
    }
  }

  // 13. Global Shortcuts
  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
      if (e.key === 'Escape') {
        searchInput.blur();
        if (authModalOverlay) authModalOverlay.classList.remove('open');
        if (eqModalOverlay) eqModalOverlay.classList.remove('open');
        if (profileModalOverlay) profileModalOverlay.classList.remove('open');
        if (playlistModalOverlay) playlistModalOverlay.classList.remove('open');
        if (commentsModalOverlay) commentsModalOverlay.classList.remove('open');
      }
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - 5);
    } else if (e.code === 'ArrowUp') {
      e.preventDefault();
      setVolume(currentVolume + 0.05);
    } else if (e.code === 'ArrowDown') {
      e.preventDefault();
      setVolume(currentVolume - 0.05);
    } else if (e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
      e.preventDefault();
      btnVolume.click();
    } else if (e.key === 'l' || e.key === 'L' || e.key === 'д' || e.key === 'Д') {
      e.preventDefault();
      dockLikeBtn.click();
    } else if (e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С') {
      e.preventDefault();
      openCommentsModal();
    } else if (e.key === 'e' || e.key === 'E' || e.key === 'у' || e.key === 'У') {
      e.preventDefault();
      btnEqToggle.click();
    } else if (e.key === 'v' || e.key === 'V' || e.key === 'м' || e.key === 'М') {
      e.preventDefault();
      btnVisToggle.click();
    } else if (e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') {
      e.preventDefault();
      dockDownloadBtn.click();
    } else if (e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') {
      e.preventDefault();
      btnShuffle.click();
    } else if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
      e.preventDefault();
      btnRepeat.click();
    } else if (e.key === 'q' || e.key === 'Q' || e.key === 'й' || e.key === 'Й') {
      e.preventDefault();
      btnQueueToggle.click();
    } else if (e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л') {
      e.preventDefault();
      document.getElementById('btn-lyrics-toggle')?.click();
    } else if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') {
      e.preventDefault();
      document.getElementById('btn-fx-toggle')?.click();
    } else if (e.key === '[') {
      e.preventDefault();
      setLoopA();
    } else if (e.key === ']') {
      e.preventDefault();
      setLoopB();
    } else if (e.key === '\\') {
      e.preventDefault();
      toggleLoopActive();
    } else if (e.key === '/') {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'Escape') {
      if (authModalOverlay) authModalOverlay.classList.remove('open');
      if (eqModalOverlay) eqModalOverlay.classList.remove('open');
      if (visualizerOverlay) visualizerOverlay.classList.remove('open');
      if (profileModalOverlay) profileModalOverlay.classList.remove('open');
      if (playlistModalOverlay) playlistModalOverlay.classList.remove('open');
      if (commentsModalOverlay) commentsModalOverlay.classList.remove('open');
      document.getElementById('theme-modal-overlay')?.classList.remove('open');
      document.getElementById('extensions-modal-overlay')?.classList.remove('open');
      document.getElementById('lyrics-overlay')?.classList.remove('open');
      document.getElementById('sleep-modal-overlay')?.classList.remove('open');
      document.getElementById('fx-modal-overlay')?.classList.remove('open');
      document.getElementById('looper-modal-overlay')?.classList.remove('open');
      document.getElementById('card-modal-overlay')?.classList.remove('open');
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TOAST NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════
  function showToast(msg) {
    let toast = document.getElementById('sc-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sc-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 96px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: var(--surface-dock);
        color: var(--text-main);
        border: 1px solid var(--border-hover);
        box-shadow: 0 12px 36px rgba(0,0,0,0.8), 0 0 18px var(--orange-glow);
        padding: 10px 22px;
        border-radius: var(--radius-pill);
        font-size: 13px;
        font-weight: 600;
        z-index: 500;
        pointer-events: none;
        opacity: 0;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 8px;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2800);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 10 THEMES SYSTEM
  // ═══════════════════════════════════════════════════════════════════════
  const THEME_COLORS = {
    onyx: [255, 85, 0],
    cyberpunk: [255, 230, 0],
    synthwave: [247, 37, 133],
    matrix: [0, 255, 102],
    nordic: [0, 210, 255],
    crimson: [255, 30, 86],
    sakura: [255, 102, 196],
    solar: [255, 183, 3],
    hyperpop: [163, 230, 53],
    titanium: [240, 240, 245]
  };

  function applyTheme(themeId) {
    if (!THEME_COLORS[themeId]) themeId = 'onyx';
    document.documentElement.setAttribute('data-theme', themeId);
    try {
      localStorage.setItem('sc_theme', themeId);
    } catch (_) {}

    document.querySelectorAll('.theme-card').forEach(card => {
      if (card.dataset.themeId === themeId) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    const rgb = THEME_COLORS[themeId] || [255, 85, 0];
    if (window.setSmokeThemeColor) {
      window.setSmokeThemeColor(rgb[0], rgb[1], rgb[2]);
    }
  }

  function initThemes() {
    let saved = 'onyx';
    try {
      saved = localStorage.getItem('sc_theme') || 'onyx';
    } catch (_) {}
    applyTheme(saved);

    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.themeId;
        applyTheme(id);
        showToast(`🎨 Color theme applied: ${card.querySelector('.theme-title span')?.textContent || id}`);
      });
    });

    const btnThemeModal = document.getElementById('btn-theme-modal');
    const themeModalOverlay = document.getElementById('theme-modal-overlay');
    const btnCloseThemeModal = document.getElementById('btn-close-theme-modal');

    if (btnThemeModal && themeModalOverlay) {
      btnThemeModal.addEventListener('click', () => {
        themeModalOverlay.classList.add('open');
      });
      if (btnCloseThemeModal) {
        btnCloseThemeModal.addEventListener('click', () => {
          themeModalOverlay.classList.remove('open');
        });
      }
      themeModalOverlay.addEventListener('click', (e) => {
        if (e.target === themeModalOverlay) themeModalOverlay.classList.remove('open');
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSIONS HUB
  // ═══════════════════════════════════════════════════════════════════════
  function initExtensionsHub() {
    const btnExtModal = document.getElementById('btn-extensions-modal');
    const extModalOverlay = document.getElementById('extensions-modal-overlay');
    const btnCloseExtModal = document.getElementById('btn-close-extensions-modal');

    if (btnExtModal && extModalOverlay) {
      btnExtModal.addEventListener('click', () => {
        extModalOverlay.classList.add('open');
      });
      if (btnCloseExtModal) {
        btnCloseExtModal.addEventListener('click', () => {
          extModalOverlay.classList.remove('open');
        });
      }
      extModalOverlay.addEventListener('click', (e) => {
        if (e.target === extModalOverlay) extModalOverlay.classList.remove('open');
      });
    }

    document.getElementById('ext-btn-open-lyrics')?.addEventListener('click', () => {
      extModalOverlay.classList.remove('open');
      openLyricsOverlay();
    });
    document.getElementById('ext-btn-open-sleep')?.addEventListener('click', () => {
      extModalOverlay.classList.remove('open');
      document.getElementById('sleep-modal-overlay')?.classList.add('open');
    });
    document.getElementById('ext-btn-open-fx')?.addEventListener('click', () => {
      extModalOverlay.classList.remove('open');
      document.getElementById('fx-modal-overlay')?.classList.add('open');
    });
    document.getElementById('ext-btn-open-looper')?.addEventListener('click', () => {
      extModalOverlay.classList.remove('open');
      document.getElementById('looper-modal-overlay')?.classList.add('open');
    });
    document.getElementById('ext-btn-open-card')?.addEventListener('click', () => {
      extModalOverlay.classList.remove('open');
      openCardGenerator();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 1: SYNCED LYRICS & KARAOKE ENGINE
  // ═══════════════════════════════════════════════════════════════════════
  let lyricsLines = [];
  let lyricsCurrentTrackId = null;
  let activeLyricIndex = -1;

  async function openLyricsOverlay() {
    const overlay = document.getElementById('lyrics-overlay');
    if (!overlay) return;
    overlay.classList.add('open');

    const curTrack = currentIndex >= 0 ? queue[currentIndex] : null;
    if (!curTrack) {
      document.getElementById('lyrics-container').innerHTML = '<div class="lyrics-empty">Play a track to view lyrics and karaoke</div>';
      return;
    }

    document.getElementById('lyrics-title').textContent = curTrack.title;
    document.getElementById('lyrics-artist').textContent = curTrack.artist;
    document.getElementById('lyrics-art').src = curTrack.artwork_url || DEFAULT_ART;

    if (lyricsCurrentTrackId !== curTrack.id) {
      await loadLyricsForTrack(curTrack);
    }
  }

  async function loadLyricsForTrack(track) {
    lyricsCurrentTrackId = track.id;
    lyricsLines = [];
    activeLyricIndex = -1;
    const container = document.getElementById('lyrics-container');
    const badge = document.getElementById('lyrics-source-badge');
    container.innerHTML = '<div class="lyrics-empty">⚡ Searching lyrics in LRCLIB database...</div>';

    try {
      const cleanTitle = track.title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
      const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(track.artist)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.syncedLyrics) {
          parseLrc(data.syncedLyrics);
          if (badge) badge.textContent = '⚡ Synced LRCLIB';
          renderLyricsLines();
          return;
        } else if (data.plainLyrics) {
          generateTimedLinesFromPlain(data.plainLyrics, track.duration_ms ? track.duration_ms / 1000 : 180);
          if (badge) badge.textContent = '📜 Plain Lyrics Timed';
          renderLyricsLines();
          return;
        }
      }
    } catch (e) {
      console.warn('LRCLIB query error:', e);
    }

    // Fallback: Rhythmic karaoke sequence
    generateFallbackLyrics(track);
    if (badge) badge.textContent = '✨ Acoustic Rhythm Mode';
    renderLyricsLines();
  }

  function parseLrc(lrcText) {
    const lines = lrcText.split('\n');
    lyricsLines = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
    for (const line of lines) {
      const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
      if (!text) continue;
      timeRegex.lastIndex = 0;
      let match;
      while ((match = timeRegex.exec(line)) !== null) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = parseFloat('0.' + match[3]);
        const time = min * 60 + sec + ms;
        lyricsLines.push({ time, text });
      }
    }
    lyricsLines.sort((a, b) => a.time - b.time);
  }

  function generateTimedLinesFromPlain(plainText, totalDuration) {
    const rawLines = plainText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length === 0) return;
    const step = Math.max(3, (totalDuration - 10) / rawLines.length);
    lyricsLines = rawLines.map((text, i) => ({
      time: 4 + i * step,
      text
    }));
  }

  function generateFallbackLyrics(track) {
    const totalDuration = track.duration_ms ? track.duration_ms / 1000 : (audio.duration || 180);
    const phrases = [
      `♪ [Intro — ${track.artist}] ♪`,
      `Lost in the frequencies, crystalline sound`,
      `Neon light waves cutting through the night city`,
      `Pure sub-bass pulsing to the rhythm`,
      `SoundCloud Ultimate • Lossless stream active`,
      `♪ [Main Beat & Drop] ♪`,
      `Turn the volume up, dissolving in the melody`,
      `Studio-grade balance, pure harmonics`,
      `♪ [Bridge & Harmonic Progression] ♪`,
      `Echoes in the silence, frequencies align`,
      `Music speaks louder than words`,
      `♪ [Outro — Fade Out] ♪`
    ];
    const step = Math.max(8, totalDuration / (phrases.length + 1));
    lyricsLines = phrases.map((text, i) => ({
      time: 2 + i * step,
      text
    }));
  }

  function renderLyricsLines() {
    const container = document.getElementById('lyrics-container');
    if (lyricsLines.length === 0) {
      container.innerHTML = '<div class="lyrics-empty">Lyrics not found for this track</div>';
      return;
    }
    container.innerHTML = lyricsLines.map((l, idx) => `
      <div class="lyrics-line" data-idx="${idx}" data-time="${l.time}">
        ${escapeHtml(l.text)}
      </div>
    `).join('');

    container.querySelectorAll('.lyrics-line').forEach(el => {
      el.addEventListener('click', () => {
        const t = parseFloat(el.dataset.time);
        if (!isNaN(t)) {
          audio.currentTime = t;
        }
      });
    });
  }

  function updateLyricsSync(currentTime) {
    if (lyricsLines.length === 0) return;
    const overlay = document.getElementById('lyrics-overlay');
    if (!overlay || !overlay.classList.contains('open')) return;

    let idx = -1;
    for (let i = 0; i < lyricsLines.length; i++) {
      if (currentTime >= lyricsLines[i].time) {
        idx = i;
      } else {
        break;
      }
    }

    if (idx !== activeLyricIndex) {
      activeLyricIndex = idx;
      const lines = document.querySelectorAll('.lyrics-line');
      lines.forEach((el, i) => {
        if (i === activeLyricIndex) {
          el.classList.add('active');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          el.classList.remove('active');
        }
      });
    }
  }

  function initLyricsEngine() {
    document.getElementById('btn-lyrics-toggle')?.addEventListener('click', openLyricsOverlay);
    document.getElementById('btn-close-lyrics')?.addEventListener('click', () => {
      document.getElementById('lyrics-overlay')?.classList.remove('open');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 2: SMART SLEEP TIMER
  // ═══════════════════════════════════════════════════════════════════════
  let sleepTimerInterval = null;
  let sleepTargetTime = null;
  let sleepTargetType = null;
  let preFadeVolume = null;

  function setSleepTimer(minutesOrType) {
    cancelSleepTimer();
    const badge = document.getElementById('sleep-badge');
    const cancelBtn = document.getElementById('btn-cancel-sleep');

    if (minutesOrType === 'track') {
      sleepTargetType = 'track';
      if (badge) {
        badge.textContent = 'Track';
        badge.style.display = 'inline-flex';
      }
      if (cancelBtn) cancelBtn.style.display = 'block';
      showToast('🌙 Music will stop after the current track finishes');
      return;
    }

    const mins = parseInt(minutesOrType, 10);
    if (isNaN(mins)) return;
    sleepTargetType = 'minutes';
    sleepTargetTime = Date.now() + mins * 60 * 1000;
    preFadeVolume = currentVolume;
    if (badge) {
      badge.textContent = `${mins}m`;
      badge.style.display = 'inline-flex';
    }
    if (cancelBtn) cancelBtn.style.display = 'block';

    sleepTimerInterval = setInterval(() => {
      const remainingMs = sleepTargetTime - Date.now();
      if (remainingMs <= 0) {
        cancelSleepTimer();
        audio.pause();
        isPlaying = false;
        updatePlayButtonUI(false);
        setVolume(preFadeVolume || 0.8);
        showToast('🌙 Sleep timer triggered: music stopped');
      } else {
        const totalSec = Math.floor(remainingMs / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        if (badge) badge.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;

        if (totalSec <= 30 && preFadeVolume !== null) {
          const ratio = Math.max(0, totalSec / 30);
          setVolume(preFadeVolume * ratio, false);
        }
      }
    }, 1000);

    showToast(`🌙 Sleep timer set for ${mins} minutes`);
  }

  function cancelSleepTimer() {
    if (sleepTimerInterval) {
      clearInterval(sleepTimerInterval);
      sleepTimerInterval = null;
    }
    if (preFadeVolume !== null) {
      setVolume(preFadeVolume, false);
      preFadeVolume = null;
    }
    sleepTargetTime = null;
    sleepTargetType = null;
    const badge = document.getElementById('sleep-badge');
    const cancelBtn = document.getElementById('btn-cancel-sleep');
    if (badge) badge.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    document.querySelectorAll('.sleep-chip').forEach(c => c.classList.remove('active'));
  }

  function initSleepTimer() {
    const overlay = document.getElementById('sleep-modal-overlay');
    document.getElementById('btn-sleep-toggle')?.addEventListener('click', () => {
      overlay?.classList.add('open');
    });
    document.getElementById('btn-close-sleep-modal')?.addEventListener('click', () => {
      overlay?.classList.remove('open');
    });
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    document.querySelectorAll('.sleep-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.sleep-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const minVal = chip.dataset.minutes;
        setSleepTimer(minVal);
        setTimeout(() => overlay?.classList.remove('open'), 400);
      });
    });

    document.getElementById('btn-cancel-sleep')?.addEventListener('click', () => {
      cancelSleepTimer();
      showToast('🌙 Sleep timer cancelled');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 3: AUDIO FX STUDIO (8D AUDIO, SPEED & NIGHTCORE)
  // ═══════════════════════════════════════════════════════════════════════
  let stereoPanner = null;
  let is8DActive = false;
  let panAngle = 0;
  let orbitAnimId = null;

  function init8DAudio() {
    initEqualizer();
  }

  function toggle8D(active) {
    init8DAudio();
    is8DActive = active;
    const dot = document.getElementById('radar-orbit-dot');

    if (active) {
      function animateOrbit() {
        if (!is8DActive) return;
        panAngle += 0.025;
        const panVal = Math.sin(panAngle);
        if (stereoPanner && audioCtx) {
          stereoPanner.pan.setValueAtTime(panVal, audioCtx.currentTime);
        }
        if (dot) {
          const radius = 42;
          const x = Math.cos(panAngle) * radius;
          const y = Math.sin(panAngle) * radius;
          dot.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        }
        orbitAnimId = requestAnimationFrame(animateOrbit);
      }
      orbitAnimId = requestAnimationFrame(animateOrbit);
      showToast('🎧 8D Audio enabled (360° binaural spatial rotation)');
    } else {
      if (orbitAnimId) cancelAnimationFrame(orbitAnimId);
      if (stereoPanner && audioCtx) stereoPanner.pan.setValueAtTime(0, audioCtx.currentTime);
      if (dot) dot.style.transform = 'translate(-50%, -50%)';
      showToast('🎧 8D Audio disabled');
    }
  }

  function setPlaybackSpeed(rate) {
    audio.playbackRate = rate;
    const label = document.getElementById('fx-speed-label');
    const slider = document.getElementById('fx-speed-slider');
    if (label) label.textContent = `${rate.toFixed(2)}x`;
    if (slider) slider.value = rate;
  }

  function initAudioFxStudio() {
    const overlay = document.getElementById('fx-modal-overlay');
    document.getElementById('btn-fx-toggle')?.addEventListener('click', () => {
      overlay?.classList.add('open');
    });
    document.getElementById('btn-close-fx-modal')?.addEventListener('click', () => {
      overlay?.classList.remove('open');
    });
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    const toggle8dInput = document.getElementById('fx-8d-toggle');
    toggle8dInput?.addEventListener('change', (e) => {
      toggle8D(e.target.checked);
    });

    const slider = document.getElementById('fx-speed-slider');
    slider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      setPlaybackSpeed(val);
      document.querySelectorAll('.speed-chip').forEach(c => c.classList.remove('active'));
    });

    document.querySelectorAll('.speed-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.speed-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const spd = parseFloat(chip.dataset.speed);
        setPlaybackSpeed(spd);
        showToast(`⚡ Speed changed: ${spd}x`);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 4: A-B PRECISION LOOPER
  // ═══════════════════════════════════════════════════════════════════════
  let loopPointA = null;
  let loopPointB = null;
  let isLoopActive = false;

  function setLoopA() {
    loopPointA = audio.currentTime;
    document.getElementById('loop-time-a').textContent = formatTime(loopPointA);
    updateLoopMarkersUI();
    showToast(`🔁 Loop point [A] set: ${formatTime(loopPointA)}`);
  }

  function setLoopB() {
    loopPointB = audio.currentTime;
    document.getElementById('loop-time-b').textContent = formatTime(loopPointB);
    updateLoopMarkersUI();
    showToast(`🔁 Loop point [B] set: ${formatTime(loopPointB)}`);
  }

  function toggleLoopActive() {
    if (loopPointA === null || loopPointB === null) {
      showToast('⚠️ Please set both loop points [A] and [B] first');
      return;
    }
    if (loopPointA >= loopPointB) {
      const temp = loopPointA;
      loopPointA = loopPointB;
      loopPointB = temp;
      document.getElementById('loop-time-a').textContent = formatTime(loopPointA);
      document.getElementById('loop-time-b').textContent = formatTime(loopPointB);
    }
    isLoopActive = !isLoopActive;
    const btn = document.getElementById('btn-toggle-loop-active');
    const dockBtn = document.getElementById('btn-looper-toggle');
    if (isLoopActive) {
      if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '🔁 Loop Active';
      }
      if (dockBtn) dockBtn.style.color = '#00FF66';
      if (audio.currentTime < loopPointA || audio.currentTime > loopPointB) {
        audio.currentTime = loopPointA;
      }
      showToast('🔁 A-B Looper active!');
    } else {
      if (btn) {
        btn.classList.remove('active');
        btn.innerHTML = '🔁 Enable Loop';
      }
      if (dockBtn) dockBtn.style.color = '';
      showToast('🔁 A-B Looper disabled');
    }
    updateLoopMarkersUI();
  }

  function clearLoop() {
    loopPointA = null;
    loopPointB = null;
    isLoopActive = false;
    document.getElementById('loop-time-a').textContent = '--:--';
    document.getElementById('loop-time-b').textContent = '--:--';
    const btn = document.getElementById('btn-toggle-loop-active');
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '🔁 Enable Loop';
    }
    const dockBtn = document.getElementById('btn-looper-toggle');
    if (dockBtn) dockBtn.style.color = '';
    updateLoopMarkersUI();
    showToast('🔁 Loop points cleared');
  }

  function updateLoopMarkersUI() {
    const dur = audio.duration;
    const markerA = document.getElementById('loop-marker-a');
    const markerB = document.getElementById('loop-marker-b');
    const region = document.getElementById('loop-region');
    if (!dur || !markerA || !markerB || !region) return;

    if (loopPointA !== null) {
      const pctA = (loopPointA / dur) * 100;
      markerA.style.left = `${pctA}%`;
      markerA.style.display = 'block';
    } else {
      markerA.style.display = 'none';
    }

    if (loopPointB !== null) {
      const pctB = (loopPointB / dur) * 100;
      markerB.style.left = `${pctB}%`;
      markerB.style.display = 'block';
    } else {
      markerB.style.display = 'none';
    }

    if (loopPointA !== null && loopPointB !== null && isLoopActive) {
      const startPct = Math.min(loopPointA, loopPointB) / dur * 100;
      const widthPct = Math.abs(loopPointB - loopPointA) / dur * 100;
      region.style.left = `${startPct}%`;
      region.style.width = `${widthPct}%`;
      region.style.display = 'block';
    } else {
      region.style.display = 'none';
    }
  }

  function checkLooper(current) {
    if (isLoopActive && loopPointA !== null && loopPointB !== null) {
      const start = Math.min(loopPointA, loopPointB);
      const end = Math.max(loopPointA, loopPointB);
      if (current >= end || current < start - 0.2) {
        audio.currentTime = start;
      }
    }
  }

  function initAbLooper() {
    const overlay = document.getElementById('looper-modal-overlay');
    document.getElementById('btn-looper-toggle')?.addEventListener('click', () => {
      overlay?.classList.add('open');
    });
    document.getElementById('btn-close-looper-modal')?.addEventListener('click', () => {
      overlay?.classList.remove('open');
    });
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    document.getElementById('btn-set-loop-a')?.addEventListener('click', setLoopA);
    document.getElementById('btn-set-loop-b')?.addEventListener('click', setLoopB);
    document.getElementById('btn-toggle-loop-active')?.addEventListener('click', toggleLoopActive);
    document.getElementById('btn-clear-loop')?.addEventListener('click', clearLoop);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 5: BENTO TRACK CARD GENERATOR
  // ═══════════════════════════════════════════════════════════════════════
  function openCardGenerator() {
    const overlay = document.getElementById('card-modal-overlay');
    if (!overlay) return;
    overlay.classList.add('open');
    drawTrackCard();
  }

  function drawTrackCard() {
    const canvas = document.getElementById('card-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 800;
    const h = canvas.height = 420;

    const track = currentIndex >= 0 ? queue[currentIndex] : {
      title: 'SoundCloud Ultimate Music',
      artist: 'SoundCloud Ultimate',
      duration_ms: 215000,
      artwork_url: ''
    };

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'onyx';
    const rgb = THEME_COLORS[currentTheme] || [255, 85, 0];

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0E0C14');
    bgGrad.addColorStop(1, '#050407');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 28);
    ctx.fill();

    // Ambient Radial Glow
    const glowGrad = ctx.createRadialGradient(w * 0.2, h * 0.35, 10, w * 0.2, h * 0.35, 260);
    glowGrad.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3)`);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.45)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 28);
    ctx.stroke();

    const renderCardContent = () => {
      // Top Right Badge
      ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.15)`;
      ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.4)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(w - 245, 45, 205, 36, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      ctx.font = 'bold 13px -apple-system, sans-serif';
      ctx.fillText('⚡ SOUNDCLOUD ULTIMATE', w - 230, 68);

      // Track Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px -apple-system, sans-serif';
      let title = track.title;
      if (title.length > 30) title = title.substring(0, 28) + '...';
      ctx.fillText(title, 230, 105);

      // Artist
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '500 18px -apple-system, sans-serif';
      ctx.fillText(track.artist, 230, 140);

      // Metadata
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '12px -apple-system, sans-serif';
      const durStr = track.duration_ms ? formatTime(track.duration_ms / 1000) : '3:45';
      ctx.fillText(`HQ Audio • ${durStr} • Zapret Active • Lossless Stream`, 230, 178);

      // Stylized Waveform Bars
      const waveStartY = 280;
      const waveHeight = 65;
      const barCount = 48;
      const barWidth = 10;
      const barGap = 5;
      const startX = 40;

      for (let i = 0; i < barCount; i++) {
        const hNorm = 0.2 + 0.8 * Math.abs(Math.sin((i / barCount) * Math.PI * 3 + 1.2) * Math.cos(i * 0.4));
        const curBarH = Math.max(8, waveHeight * hNorm);
        const bx = startX + i * (barWidth + barGap);
        const by = waveStartY + (waveHeight - curBarH) / 2;

        const barGrad = ctx.createLinearGradient(bx, by, bx, by + curBarH);
        barGrad.addColorStop(0, `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
        barGrad.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3)`);
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(bx, by, barWidth, curBarH, 4);
        ctx.fill();
      }

      // Footer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.fillText('github.com/masyaslasher/soundcloud-ultimate', 40, h - 30);
      ctx.fillText('AMOLED Bento Glass Edition', w - 210, h - 30);
    };

    if (track.artwork_url) {
      const artImg = new Image();
      artImg.crossOrigin = 'anonymous';
      artImg.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(40, 50, 160, 160, 18);
        ctx.clip();
        ctx.drawImage(artImg, 40, 50, 160, 160);
        ctx.restore();

        ctx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.6)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(40, 50, 160, 160, 18);
        ctx.stroke();

        renderCardContent();
      };
      artImg.onerror = () => {
        ctx.fillStyle = '#1C1A24';
        ctx.beginPath();
        ctx.roundRect(40, 50, 160, 160, 18);
        ctx.fill();
        renderCardContent();
      };
      artImg.src = track.artwork_url;
    } else {
      ctx.fillStyle = '#1C1A24';
      ctx.beginPath();
      ctx.roundRect(40, 50, 160, 160, 18);
      ctx.fill();
      renderCardContent();
    }
  }

  function initCardGenerator() {
    const overlay = document.getElementById('card-modal-overlay');
    document.getElementById('dock-card-btn')?.addEventListener('click', openCardGenerator);
    document.getElementById('btn-close-card-modal')?.addEventListener('click', () => {
      overlay?.classList.remove('open');
    });
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });

    document.getElementById('btn-copy-card')?.addEventListener('click', () => {
      const canvas = document.getElementById('card-canvas');
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (!blob) return;
        try {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]).then(() => {
            showToast('📋 Card copied to clipboard!');
          }).catch(e => {
            console.warn('Clipboard write failed:', e);
            showToast('⚠️ Could not copy, please use "Download PNG"');
          });
        } catch (e) {
          showToast('⚠️ Please save via "Download PNG"');
        }
      });
    });

    document.getElementById('btn-download-card')?.addEventListener('click', () => {
      const canvas = document.getElementById('card-canvas');
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `SoundCloud-Card-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('💾 Card image saved!');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EXTENSION 6: DISCORD RICH PRESENCE (LINUX & WINDOWS)
  // ═══════════════════════════════════════════════════════════════════════
  let lastDiscordSync = 0;
  let discordSyncTimeout = null;

  async function syncDiscordRPC(track, playing) {
    if (!track) return;
    const toggle = document.getElementById('discord-rpc-toggle');
    if (toggle && !toggle.checked) return;

    clearTimeout(discordSyncTimeout);
    const now = Date.now();
    if (now - lastDiscordSync < 500) {
      discordSyncTimeout = setTimeout(() => syncDiscordRPC(track, playing), 500);
      return;
    }
    lastDiscordSync = now;

    const curTime = audio ? (audio.currentTime || 0) : 0;
    const dur = (audio && audio.duration && !isNaN(audio.duration) && audio.duration > 0)
      ? audio.duration
      : ((track.duration_ms ? track.duration_ms / 1000 : 0) || (track.duration || 0));

    const payload = {
      title: track.title || 'SoundCloud Track',
      artist: track.artist || track.user?.username || 'SoundCloud Artist',
      duration_secs: Math.round(dur),
      current_time_secs: Math.round(curTime),
      is_playing: !!playing,
      permalink_url: track.permalink_url || null,
      artwork_url: track.artwork_url || null
    };

    try {
      const res = await fetch('/api/discord/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        checkDiscordStatus();
      }
    } catch (e) {
      console.debug('Discord RPC sync failed:', e);
    }
  }

  async function clearDiscordRPC() {
    try {
      await fetch('/api/discord/clear', { method: 'POST' });
    } catch (e) {}
  }

  async function checkDiscordStatus() {
    try {
      const res = await fetch('/api/discord/status');
      if (!res.ok) return;
      const st = await res.json();
      const toggle = document.getElementById('discord-rpc-toggle');
      if (toggle && typeof st.enabled === 'boolean') {
        toggle.checked = st.enabled;
      }
      updateDiscordBadge(st.connected, st.username);
    } catch (e) {}
  }

  function updateDiscordBadge(connected, username) {
    const badge = document.getElementById('discord-badge-status');
    const userInfo = document.getElementById('discord-user-info');
    const dockBtn = document.getElementById('dock-discord-btn');
    if (badge) {
      if (connected) {
        badge.textContent = 'Active';
        badge.style.background = 'rgba(87, 242, 135, 0.2)';
        badge.style.color = '#57F287';
        badge.style.borderColor = 'rgba(87, 242, 135, 0.4)';
      } else {
        badge.textContent = 'Standby';
        badge.style.background = 'rgba(255, 255, 255, 0.08)';
        badge.style.color = 'var(--text-dim)';
        badge.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      }
    }
    if (userInfo) {
      if (connected && username) {
        userInfo.textContent = `Connected as @${username} (Linux & Windows IPC)`;
        userInfo.style.color = '#5865F2';
      } else {
        userInfo.textContent = 'Waiting for Discord desktop app...';
        userInfo.style.color = 'var(--text-dim)';
      }
    }
    if (dockBtn) {
      dockBtn.style.opacity = connected ? '1' : '0.45';
      dockBtn.title = connected && username ? `Discord RPC: Connected as @${username}` : 'Discord Rich Presence (Click to view)';
    }
  }

  function initDiscordRPC() {
    const dockBtn = document.getElementById('dock-discord-btn');
    if (dockBtn) {
      dockBtn.addEventListener('click', () => {
        document.getElementById('extensions-modal-overlay')?.classList.add('open');
      });
    }

    const toggle = document.getElementById('discord-rpc-toggle');
    if (toggle) {
      toggle.addEventListener('change', async () => {
        try {
          const res = await fetch('/api/discord/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: toggle.checked })
          });
          const st = await res.json();
          updateDiscordBadge(st.connected, st.username);
          if (toggle.checked) {
            showToast('Discord Rich Presence enabled');
            if (currentIndex >= 0 && queue[currentIndex]) {
              syncDiscordRPC(queue[currentIndex], isPlaying);
            }
          } else {
            showToast('Discord Rich Presence disabled');
          }
        } catch (e) {
          console.warn('Failed to toggle Discord RPC:', e);
        }
      });
    }

    // Check status immediately and poll every 8 seconds
    checkDiscordStatus();
    setInterval(checkDiscordStatus, 8000);
  }

  // Expose API
  window.scApp = {
    openArtistProfile,
    openPlaylistInspector,
    openCommentsModal,
    openLyricsOverlay,
    openCardGenerator,
    syncDiscordRPC,
    applyTheme,
    setSleepTimer,
    toggle8D,
    setPlaybackSpeed,
    startTrackRadio,
    loadMyHistory,
    loadMyLikes,
    loadMyPlaylists,
    loadMyStream
  };

  // Init
  initThemes();
  initLanguageSwitcher();

  // ═══════════════════════════════════════════════════════════════════════
  // SUBTLE & UNOBTRUSIVE LANGUAGE SWITCHER (EN / RU)
  // ═══════════════════════════════════════════════════════════════════════
  function initLanguageSwitcher() {
    const btnLang = document.getElementById("btn-lang-toggle");
    const btnDropdownLang = document.getElementById("btn-dropdown-lang");
    const optEn = document.getElementById("lang-opt-en");
    const optRu = document.getElementById("lang-opt-ru");
    let currentLang = localStorage.getItem("lang") || "en";

    function applyLanguage(lang) {
      currentLang = lang;
      localStorage.setItem("lang", lang);

      // Update subtle header pill
      if (optEn) optEn.classList.toggle("active", lang === "en");
      if (optRu) optRu.classList.toggle("active", lang === "ru");

      // Update dropdown item
      const txtDropLang = document.getElementById("txt-dropdown-lang");
      if (txtDropLang) {
        txtDropLang.textContent = lang === "ru" ? "Язык: Русский (RU)" : "Language: English (EN)";
      }

      // DOM Elements
      const searchInp = document.getElementById("search-input");
      const txtThemes = document.getElementById("txt-themes-btn");
      const txtExt = document.getElementById("txt-extensions-btn");
      const txtLogin = document.getElementById("txt-login-btn");
      const txtMyProf = document.getElementById("txt-my-profile");
      const txtLogout = document.getElementById("txt-logout");
      const chipTrend = document.getElementById("chip-trending");
      const chipLk = document.getElementById("chip-likes");
      const chipPl = document.getElementById("chip-playlists");
      const chipSt = document.getElementById("chip-stream");
      const chipHs = document.getElementById("chip-history");
      const heroTag = document.getElementById("hero-tag");
      const txtListenNow = document.getElementById("txt-listen-now");
      const txtQueueTitle = document.getElementById("txt-queue-title");

      // Modal elements
      const txtAuthTitle = document.getElementById("txt-auth-modal-title");
      const btn1Click = document.getElementById("btn-import-browser");
      const txtAuthHelpHead = document.getElementById("txt-auth-help-head");
      const txtAuthHelpBody = document.getElementById("txt-auth-help-body");
      const btnOpenSc = document.getElementById("btn-open-sc-signin");
      const txtAuthDivider = document.getElementById("txt-auth-divider");
      const btnSubmitToken = document.getElementById("btn-submit-token");
      const txtThemeTitle = document.getElementById("txt-theme-modal-title");
      const txtExtTitle = document.getElementById("txt-ext-modal-title");
      const txtEqTitle = document.getElementById("txt-eq-title");
      const txtCommentsTitle = document.getElementById("txt-comments-title");
      const commentInput = document.getElementById("new-comment-input");
      const btnSendComment = document.getElementById("btn-send-comment");
      const txtSleepTitle = document.getElementById("txt-sleep-modal-title");
      const txtSleepDesc = document.getElementById("txt-sleep-desc");
      const sleepChipTrack = document.getElementById("sleep-chip-track");
      const btnCancelSleep = document.getElementById("btn-cancel-sleep");
      const txtFxTitle = document.getElementById("txt-fx-modal-title");
      const txtRadarHint = document.getElementById("txt-radar-hint");
      const txtFxSpeedTitle = document.getElementById("txt-fx-speed-title");
      const speedChipNorm = document.getElementById("speed-chip-norm");
      const txtLooperTitle = document.getElementById("txt-looper-modal-title");
      const txtLooperDesc = document.getElementById("txt-looper-desc");
      const txtLoopStart = document.getElementById("txt-loop-start");
      const txtLoopEnd = document.getElementById("txt-loop-end");
      const txtBtnLoopActive = document.getElementById("txt-btn-loop-active");
      const txtBtnLoopClear = document.getElementById("txt-btn-loop-clear");
      const txtCardTitle = document.getElementById("txt-card-modal-title");
      const txtBtnCopyCard = document.getElementById("txt-btn-copy-card");
      const txtBtnDownloadCard = document.getElementById("txt-btn-download-card");

      if (lang === "ru") {
        if (searchInp) searchInp.placeholder = "Поиск треков, исполнителей, альбомов...";
        if (txtThemes) txtThemes.textContent = "Темы (10)";
        if (txtExt) txtExt.textContent = "Расширения";
        if (txtLogin) txtLogin.textContent = "Войти в аккаунт";
        if (txtMyProf) txtMyProf.textContent = "Мой профиль";
        if (txtLogout) txtLogout.textContent = "Выйти";
        if (chipTrend) chipTrend.textContent = "🔥 В тренде";
        if (chipLk) chipLk.textContent = "❤️ Мои Лайки";
        if (chipPl) chipPl.textContent = "📂 Мои Плейлисты";
        if (chipSt) chipSt.textContent = "📡 Моя Лента";
        if (chipHs) chipHs.textContent = "🕒 История";
        if (heroTag) heroTag.textContent = "🔥 Топ недели";
        if (txtListenNow) txtListenNow.textContent = "Слушать сейчас";
        if (txtQueueTitle) txtQueueTitle.textContent = "Очередь воспроизведения";
        if (!isPlaying && currentIndex === -1 && playerTitle) playerTitle.textContent = "Выберите трек для воспроизведения";

        // Modals RU
        if (txtAuthTitle) txtAuthTitle.textContent = "Вход в аккаунт SoundCloud";
        if (btn1Click) btn1Click.textContent = "⚡ Авторизоваться в 1 клик (из Chromium)";
        if (txtAuthHelpHead) txtAuthHelpHead.textContent = "Вход без ручного ввода токенов:";
        if (txtAuthHelpBody) txtAuthHelpBody.textContent = "Если вы уже вошли на soundcloud.com в Chromium, нажмите кнопку выше — приложение автоматически подключит ваш аккаунт!";
        if (btnOpenSc) btnOpenSc.textContent = "🌐 Открыть страницу входа SoundCloud в браузере";
        if (txtAuthDivider) txtAuthDivider.textContent = "или введите токен сессии";
        if (btnSubmitToken) btnSubmitToken.textContent = "Подключить аккаунт";
        if (txtThemeTitle) txtThemeTitle.textContent = "Темы оформления (10 AMOLED палитр)";
        if (txtExtTitle) txtExtTitle.textContent = "Центр встроенных расширений (6 модулей)";
        const txtExtDiscordName = document.getElementById("txt-ext-discord-name");
        const txtExtDiscordDesc = document.getElementById("txt-ext-discord-desc");
        if (txtExtDiscordName) txtExtDiscordName.textContent = "Discord Rich Presence (Linux и Windows)";
        if (txtExtDiscordDesc) txtExtDiscordDesc.textContent = "Синхронизация трека, исполнителя, таймлайна и кликабельной ссылки в профиле Discord без сторонних утилит.";
        if (txtEqTitle) txtEqTitle.textContent = "Студийный Эквалайзер & Бас";
        if (txtCommentsTitle) txtCommentsTitle.textContent = "Комментарии к треку";
        if (commentInput) commentInput.placeholder = "Написать комментарий на текущей секунде...";
        if (btnSendComment) btnSendComment.textContent = "Отправить";
        if (txtSleepTitle) txtSleepTitle.textContent = "Умный таймер сна";
        if (txtSleepDesc) txtSleepDesc.textContent = "Музыка плавно затихнет за 30 секунд до истечения времени, оберегая ваш сон.";
        if (sleepChipTrack) sleepChipTrack.textContent = "Конец трека";
        if (btnCancelSleep) btnCancelSleep.textContent = "Отключить активный таймер";
        if (txtFxTitle) txtFxTitle.textContent = "Студия звуковых эффектов FX";
        if (txtRadarHint) txtRadarHint.textContent = "Рекомендуется слушать в наушниках для эффекта 3D-орбиты";
        if (txtFxSpeedTitle) txtFxSpeedTitle.textContent = "⚡ Скорость & Тональность";
        if (speedChipNorm) speedChipNorm.textContent = "Обычная";
        if (txtLooperTitle) txtLooperTitle.textContent = "A-B Looper (Зацикливание фрагмента)";
        if (txtLooperDesc) txtLooperDesc.textContent = "Позволяет бесконечно воспроизводить выбранный фрагмент трека (соло, дроп, бит).";
        if (txtLoopStart) txtLoopStart.textContent = "Метка начала:";
        if (txtLoopEnd) txtLoopEnd.textContent = "Метка конца:";
        if (txtBtnLoopActive) txtBtnLoopActive.textContent = "Включить цикл";
        if (txtBtnLoopClear) txtBtnLoopClear.textContent = "Сбросить";
        if (txtCardTitle) txtCardTitle.textContent = "Bento-карточка трека для соцсетей";
        if (txtBtnCopyCard) txtBtnCopyCard.textContent = "Скопировать картинку";
        if (txtBtnDownloadCard) txtBtnDownloadCard.textContent = "Скачать PNG";
      } else {
        if (searchInp) searchInp.placeholder = "Search tracks, artists, albums...";
        if (txtThemes) txtThemes.textContent = "Themes (10)";
        if (txtExt) txtExt.textContent = "Extensions";
        if (txtLogin) txtLogin.textContent = "Sign In";
        if (txtMyProf) txtMyProf.textContent = "My Profile";
        if (txtLogout) txtLogout.textContent = "Sign Out";
        if (chipTrend) chipTrend.textContent = "🔥 Trending";
        if (chipLk) chipLk.textContent = "❤️ Liked";
        if (chipPl) chipPl.textContent = "📂 Playlists";
        if (chipSt) chipSt.textContent = "📡 Stream";
        if (chipHs) chipHs.textContent = "🕒 History";
        if (heroTag) heroTag.textContent = "🔥 Top of the Week";
        if (txtListenNow) txtListenNow.textContent = "Listen Now";
        if (txtQueueTitle) txtQueueTitle.textContent = "Play Queue";
        if (!isPlaying && currentIndex === -1 && playerTitle) playerTitle.textContent = "Select a track to play";

        // Modals EN
        if (txtAuthTitle) txtAuthTitle.textContent = "Sign In to SoundCloud";
        if (btn1Click) btn1Click.textContent = "⚡ 1-Click Sign In (from Chromium)";
        if (txtAuthHelpHead) txtAuthHelpHead.textContent = "Sign in without manual tokens:";
        if (txtAuthHelpBody) txtAuthHelpBody.textContent = "If you are already logged in to soundcloud.com in Chromium / Chrome, click the button above to connect automatically!";
        if (btnOpenSc) btnOpenSc.textContent = "🌐 Open SoundCloud Login Page in Browser";
        if (txtAuthDivider) txtAuthDivider.textContent = "or enter session token manually";
        if (btnSubmitToken) btnSubmitToken.textContent = "Connect Account";
        if (txtThemeTitle) txtThemeTitle.textContent = "Themes (10 AMOLED Palettes)";
        if (txtExtTitle) txtExtTitle.textContent = "Built-in Extensions Hub (6 Modules)";
        const txtExtDiscordName = document.getElementById("txt-ext-discord-name");
        const txtExtDiscordDesc = document.getElementById("txt-ext-discord-desc");
        if (txtExtDiscordName) txtExtDiscordName.textContent = "Discord Rich Presence (Linux & Windows)";
        if (txtExtDiscordDesc) txtExtDiscordDesc.textContent = "Broadcasts current track, artist, album art, animated progress bar, and 'Listen on SoundCloud' button to your Discord profile on Linux & Windows.";
        if (txtEqTitle) txtEqTitle.textContent = "Studio Equalizer & Bass";
        if (txtCommentsTitle) txtCommentsTitle.textContent = "Track Comments";
        if (commentInput) commentInput.placeholder = "Write a comment at current timestamp...";
        if (btnSendComment) btnSendComment.textContent = "Send";
        if (txtSleepTitle) txtSleepTitle.textContent = "Smart Sleep Timer";
        if (txtSleepDesc) txtSleepDesc.textContent = "Music will gently fade out over 30 seconds before stopping, preserving your sleep.";
        if (sleepChipTrack) sleepChipTrack.textContent = "End of track";
        if (btnCancelSleep) btnCancelSleep.textContent = "Cancel Active Timer";
        if (txtFxTitle) txtFxTitle.textContent = "Audio FX Studio";
        if (txtRadarHint) txtRadarHint.textContent = "Headphones recommended for 3D orbital binaural effect";
        if (txtFxSpeedTitle) txtFxSpeedTitle.textContent = "⚡ Speed & Pitch";
        if (speedChipNorm) speedChipNorm.textContent = "Normal";
        if (txtLooperTitle) txtLooperTitle.textContent = "A-B Precision Looper";
        if (txtLooperDesc) txtLooperDesc.textContent = "Seamlessly loop any segment of the track (guitar solo, beat drop, chorus).";
        if (txtLoopStart) txtLoopStart.textContent = "Start:";
        if (txtLoopEnd) txtLoopEnd.textContent = "End:";
        if (txtBtnLoopActive) txtBtnLoopActive.textContent = "Enable Loop";
        if (txtBtnLoopClear) txtBtnLoopClear.textContent = "Reset";
        if (txtCardTitle) txtCardTitle.textContent = "Social Bento Track Card Generator";
        if (txtBtnCopyCard) txtBtnCopyCard.textContent = "Copy to Clipboard";
        if (txtBtnDownloadCard) txtBtnDownloadCard.textContent = "Download PNG";
      }
    }

    function toggleLanguage() {
      const nextLang = currentLang === "en" ? "ru" : "en";
      applyLanguage(nextLang);
      showToast(nextLang === "ru" ? "🇷🇺 Язык интерфейса: Русский" : "🇬🇧 Interface Language: English");
    }

    if (btnLang) {
      btnLang.addEventListener("click", toggleLanguage);
    }
    if (btnDropdownLang) {
      btnDropdownLang.addEventListener("click", () => {
        toggleLanguage();
        if (userDropdown) userDropdown.classList.remove("open");
      });
    }

    // Subtle Hotkey: Alt + Shift + L
    window.addEventListener("keydown", (e) => {
      if (e.altKey && e.shiftKey && (e.key === "L" || e.key === "l" || e.key === "д" || e.key === "Д")) {
        toggleLanguage();
      }
    });

    applyLanguage(currentLang);
  }

  initExtensionsHub();
  initLyricsEngine();
  initSleepTimer();
  initAudioFxStudio();
  initAbLooper();
  initCardGenerator();
  initDiscordRPC();

  // URL query params for direct modal/theme preview
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    if (themeParam) applyTheme(themeParam);
    const modalParam = urlParams.get('modal');
    if (modalParam === 'themes') document.getElementById('theme-modal-overlay')?.classList.add('open');
    if (modalParam === 'extensions') document.getElementById('extensions-modal-overlay')?.classList.add('open');
    if (modalParam === 'fx') document.getElementById('fx-modal-overlay')?.classList.add('open');
    if (modalParam === 'lyrics') openLyricsOverlay();
    if (modalParam === 'looper') document.getElementById('looper-modal-overlay')?.classList.add('open');
    if (modalParam === 'sleep') document.getElementById('sleep-modal-overlay')?.classList.add('open');
    if (modalParam === 'card') openCardGenerator();
  } catch (_) {}

  setVolume(currentVolume, false);
  checkSystemStatus();
  checkAuthStatus();
  loadTrending('all-music');
})();
