// =============================================
//   DREAMSCAPE GAMING CAFE — MAIN JAVASCRIPT
// =============================================

// ---- PARTICLES ----
(function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#b44fff', '#00f5ff', '#ff006e', '#39ff14'];
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${color};
      box-shadow: 0 0 ${size * 3}px ${color};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
})();

// ---- NAVBAR SCROLL ----
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---- TYPED TEXT ANIMATION ----
const lines = [
  '> Loading game library... ✓',
  '> Setting up stations... ✓',
  '> Brewing coffee... ✓',
  '> Configuring RGB... ✓',
  '> Almost ready...',
  '> Welcome to Dreamscape!',
];
let lineIdx = 0;
let charIdx = 0;
let isDeleting = false;
const typedEl = document.getElementById('typedText');

function typeEffect() {
  const current = lines[lineIdx];

  if (!isDeleting) {
    typedEl.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      setTimeout(() => { isDeleting = true; }, 1800);
      setTimeout(typeEffect, 1850);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      lineIdx = (lineIdx + 1) % lines.length;
    }
  }
  setTimeout(typeEffect, isDeleting ? 40 : 70);
}

typeEffect();

// ---- VOTING SYSTEM ----
const votes = {};

function vote(btn, key) {
  // Determine vote group
  const group = key.split('-')[0];
  const resultId = `vote-result-${group}`;
  const resultEl = document.getElementById(resultId);

  // Find all buttons in the same group
  const container = btn.closest('.vote-options');
  container.querySelectorAll('.vote-btn').forEach(b => b.classList.remove('voted'));
  btn.classList.add('voted');

  votes[group] = key;

  const labels = {
    'pc-budget': '💚 Budget Beast (₹60K–80K)',
    'pc-mid':    '💛 Mid Range (₹1L–1.5L)',
    'pc-high':   '🔴 High End (₹2L+)',
    'theme-cyber': '🌌 Cyberpunk Neon',
    'theme-space': '🚀 Sci-Fi Space',
    'theme-retro': '🏯 Retro Arcade',
  };

  if (resultEl) {
    resultEl.textContent = `✅ You voted for: ${labels[key]}`;
  }
}

// ---- CONTACT FORM ----
function handleContact(e) {
  e.preventDefault();
  const name = document.getElementById('contactName').value.trim();
  const note = document.getElementById('form-note');

  // Simulate sending (in real use, connect to Formspree or similar)
  note.textContent = `✅ Thanks ${name}! Your message has been received. Basil will reach out soon!`;

  document.getElementById('contactName').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMsg').value = '';

  setTimeout(() => { note.textContent = ''; }, 5000);
}

// ---- SCROLL ANIMATIONS ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

// Animate cards on scroll
document.querySelectorAll('.equip-card, .design-card, .game-card, .food-card, .update-card, .community-card, .service-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ---- ACTIVE NAV HIGHLIGHTING ----
const sections = document.querySelectorAll('section[id]');
const navA = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) {
      current = s.getAttribute('id');
    }
  });
  navA.forEach(a => {
    a.style.color = '';
    if (a.getAttribute('href') === `#${current}`) {
      a.style.color = '#00f5ff';
      a.style.textShadow = '0 0 10px #00f5ff';
    } else {
      a.style.textShadow = '';
    }
  });
});

// =============================================
//   COMMUNITY LIVE STREAM CHAT (YOUTUBE / IG STYLE)
// =============================================
(function initCommunityLiveChat() {
  const CHAT_TOPIC = 'dreamscape_gaming_cafe_live_chat';
  const CHAT_URL = `https://ntfy.sh/${CHAT_TOPIC}`;
  const STORAGE_KEY = 'dreamscape_chat_messages_v2';
  const UPVOTES_KEY = 'dreamscape_chat_upvotes_v2';
  const USER_KEY = 'dreamscape_chat_username';

  const chatMessagesEl = document.getElementById('chatMessages');
  const chatFormEl = document.getElementById('chatForm');
  const chatNameEl = document.getElementById('chatName');
  const chatMsgEl = document.getElementById('chatMsg');
  const chatCategoryEl = document.getElementById('chatCategory');
  const chatMsgCountEl = document.getElementById('chatMsgCount');
  const charCounterEl = document.getElementById('charCounter');
  const jumpLatestBtn = document.getElementById('jumpLatestBtn');
  const viewerCountEl = document.getElementById('viewerCount');
  const flyingReactionsEl = document.getElementById('flyingReactions');
  const filterPills = document.querySelectorAll('.stream-pill');

  if (!chatMessagesEl || !chatFormEl) return;

  let activeFilter = 'All';
  let messages = [];
  let userUpvotes = new Set(JSON.parse(localStorage.getItem(UPVOTES_KEY) || '[]'));
  let isUserScrolledUp = false;

  // Load saved user name
  const savedName = localStorage.getItem(USER_KEY);
  if (savedName && chatNameEl) {
    chatNameEl.value = savedName;
  }

  // Character counter
  if (chatMsgEl && charCounterEl) {
    chatMsgEl.addEventListener('input', () => {
      const remaining = 300 - chatMsgEl.value.length;
      charCounterEl.textContent = `${remaining}`;
    });
  }

  // Scroll detection for YouTube-style "Jump to latest"
  chatMessagesEl.addEventListener('scroll', () => {
    const distanceFromBottom = chatMessagesEl.scrollHeight - chatMessagesEl.scrollTop - chatMessagesEl.clientHeight;
    isUserScrolledUp = distanceFromBottom > 120;
    if (jumpLatestBtn) {
      if (isUserScrolledUp) {
        jumpLatestBtn.classList.add('visible');
      } else {
        jumpLatestBtn.classList.remove('visible');
      }
    }
  });

  // Dynamic viewer count simulation (YouTube / IG Live feel)
  let currentViewers = 248;
  setInterval(() => {
    const change = Math.floor(Math.random() * 7) - 3;
    currentViewers = Math.max(180, Math.min(350, currentViewers + change));
    if (viewerCountEl) {
      viewerCountEl.textContent = currentViewers;
    }
  }, 4000);

  // Quick Emoji Insertion
  window.insertEmoji = function(emoji) {
    if (!chatMsgEl) return;
    chatMsgEl.value += emoji;
    chatMsgEl.focus();
    if (charCounterEl) {
      charCounterEl.textContent = `${300 - chatMsgEl.value.length}`;
    }
  };

  // Flying Instagram Live Floating Reactions
  window.triggerReaction = function(emoji) {
    if (!flyingReactionsEl) return;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'flying-emoji';
        el.textContent = emoji;
        el.style.left = `${Math.random() * 70 + 15}%`;
        el.style.animationDuration = `${Math.random() * 0.8 + 2}s`;
        flyingReactionsEl.appendChild(el);
        setTimeout(() => el.remove(), 2600);
      }, i * 140);
    }
  };

  // Default seed messages with realistic timestamps
  const defaultSeeds = [
    {
      id: 'seed-1',
      name: 'Basil (Founder)',
      isFounder: true,
      tag: 'Announcement',
      text: '🔥 Welcome to Dreamscape Live Chat! We are actively designing the cafe. Drop what monitors, keyboards, games, and lounge designs you want to see!',
      time: Date.now() - 3600000 * 4,
      upvotes: 38
    },
    {
      id: 'seed-2',
      name: 'ViperX',
      tag: 'Gadgets',
      text: '240Hz+ gaming monitors are a must for competitive FPS. Also please go with low-latency optical gaming mice like Razer DeathAdder or Logitech G Pro!',
      time: Date.now() - 3600000 * 2.5,
      upvotes: 21
    },
    {
      id: 'seed-3',
      name: 'KavyaGamer',
      tag: 'Games',
      text: 'Weekly LAN tournaments on Saturdays! Valorant 5v5 and EA Sports FC24. The local gaming community will flock to this cafe for sure!',
      time: Date.now() - 3600000 * 1.5,
      upvotes: 19
    },
    {
      id: 'seed-4',
      name: 'CyberRonin',
      tag: 'Design',
      text: 'Make sure there are private streaming sound-dampened booths for creators, along with the open battlestations. The cyberpunk neon vibe will be fire 🔥',
      time: Date.now() - 1800000,
      upvotes: 15
    }
  ];

  // Initialize messages from localStorage or defaults
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    messages = cached ? JSON.parse(cached) : defaultSeeds;
  } catch (e) {
    messages = defaultSeeds;
  }

  renderMessages();
  fetchRemoteHistory();
  connectLiveStream();

  // Filter click handler
  window.filterChat = function(cat) {
    activeFilter = cat;
    filterPills.forEach(p => {
      if (p.getAttribute('data-cat') === cat) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
    renderMessages();
  };

  // Upvote message
  window.upvoteMessage = function(id) {
    if (userUpvotes.has(id)) {
      userUpvotes.delete(id);
      const msg = messages.find(m => m.id === id);
      if (msg) msg.upvotes = Math.max(0, (msg.upvotes || 1) - 1);
    } else {
      userUpvotes.add(id);
      const msg = messages.find(m => m.id === id);
      if (msg) msg.upvotes = (msg.upvotes || 0) + 1;
      triggerReaction('❤️');
    }
    localStorage.setItem(UPVOTES_KEY, JSON.stringify(Array.from(userUpvotes)));
    saveMessagesToStorage();
    renderMessages();
  };

  // Handle Send
  window.handleSendChat = async function(e) {
    e.preventDefault();
    const name = (chatNameEl.value || '').trim() || 'Anonymous Gamer';
    const text = (chatMsgEl.value || '').trim();
    const tag = chatCategoryEl ? chatCategoryEl.value : 'Ideas';

    if (!text) return;

    localStorage.setItem(USER_KEY, name);

    const isFounder = name.toLowerCase().includes('basil');
    const newMsg = {
      id: 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: name,
      isFounder: isFounder,
      tag: tag,
      text: text,
      time: Date.now(),
      upvotes: 1
    };

    userUpvotes.add(newMsg.id);
    localStorage.setItem(UPVOTES_KEY, JSON.stringify(Array.from(userUpvotes)));

    messages.push(newMsg);
    saveMessagesToStorage();
    renderMessages();
    scrollChatToBottom(true);
    triggerReaction('🔥');

    chatMsgEl.value = '';
    if (charCounterEl) charCounterEl.textContent = '300';
    chatMsgEl.focus();

    // Broadcast live over network
    try {
      await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(newMsg)
      });
    } catch (err) {
      console.log('Broadcast saved locally:', err);
    }
  };

  function renderMessages() {
    const filtered = activeFilter === 'All'
      ? messages
      : messages.filter(m => m.tag === activeFilter);

    if (chatMsgCountEl) {
      chatMsgCountEl.textContent = `${messages.length} live message${messages.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      chatMessagesEl.innerHTML = `
        <div class="chat-loading">
          <div style="font-size:2.5rem;margin-bottom:0.5rem">💬</div>
          <p>No comments in <strong>${escapeHtml(activeFilter)}</strong> yet.<br>Type below to be the first live comment!</p>
        </div>
      `;
      return;
    }

    const currentUserName = (chatNameEl ? chatNameEl.value : '').trim().toLowerCase();

    chatMessagesEl.innerHTML = filtered.map(m => {
      const isUpvoted = userUpvotes.has(m.id);
      const isOwn = currentUserName && m.name.toLowerCase() === currentUserName;
      const initial = (m.name || 'G').trim().charAt(0).toUpperCase();

      // DEDICATED SENT DATE & TIME
      const dateObj = new Date(m.time || Date.now());
      const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const relativeTime = getRelativeTime(m.time);

      return `
        <div class="stream-msg-card ${isOwn ? 'own-msg' : ''} ${m.isFounder ? 'founder-msg' : ''}" data-id="${m.id}">
          <div class="msg-avatar-wrap">
            <div class="msg-avatar ${m.isFounder ? 'founder' : ''}">${m.isFounder ? '👑' : initial}</div>
          </div>
          <div class="msg-content-wrap">
            <div class="msg-top-row">
              <div class="msg-user-info">
                <span class="msg-user-name">${escapeHtml(m.name)}</span>
                ${m.isFounder ? '<span class="founder-badge">FOUNDER</span>' : ''}
                <span class="msg-category-pill cat-${m.tag}">${escapeHtml(m.tag || 'Ideas')}</span>
              </div>
              <!-- DEDICATED SENT DATE & TIME SPACE -->
              <div class="msg-timestamp-space" title="Sent: ${dateStr} at ${timeStr}">
                <span class="time-date-badge">
                  <i class="far fa-calendar-alt"></i> ${dateStr}
                  <span class="time-dot">•</span>
                  <i class="far fa-clock"></i> ${timeStr}
                </span>
              </div>
            </div>
            <div class="msg-bubble-text">
              ${escapeHtml(m.text)}
            </div>
            <div class="msg-bottom-row">
              <button type="button" class="like-chip ${isUpvoted ? 'liked' : ''}" onclick="upvoteMessage('${m.id}')" title="Upvote this idea">
                <i class="${isUpvoted ? 'fas' : 'far'} fa-heart"></i>
                <span>${m.upvotes || 0}</span>
              </button>
              <span class="relative-time-ago">${relativeTime}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.scrollChatToBottom = function(force = false) {
    if (force || !isUserScrolledUp) {
      chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
      if (jumpLatestBtn) jumpLatestBtn.classList.remove('visible');
    }
  };

  function saveMessagesToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
    } catch (e) {}
  }

  // Fetch recent messages from remote server
  async function fetchRemoteHistory() {
    try {
      const res = await fetch(`${CHAT_URL}/json?poll=1&since=48h`);
      if (!res.ok) return;
      const text = await res.text();
      const lines = text.split('\n');
      let addedNew = false;

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const item = JSON.parse(line);
          if (item.message) {
            const data = JSON.parse(item.message);
            if (data && data.text && !messages.some(m => m.id === data.id || (m.name === data.name && m.text === data.text))) {
              messages.push(data);
              addedNew = true;
            }
          }
        } catch (e) {}
      }

      if (addedNew) {
        messages.sort((a, b) => (a.time || 0) - (b.time || 0));
        saveMessagesToStorage();
        renderMessages();
        scrollChatToBottom();
      }
    } catch (e) {
      console.log('Using local message cache');
    }
  }

  // Real-time EventSource connection
  function connectLiveStream() {
    try {
      const es = new EventSource(`${CHAT_URL}/sse`);
      es.onmessage = function(event) {
        try {
          const data = JSON.parse(event.data);
          if (data && data.message) {
            const parsed = JSON.parse(data.message);
            if (parsed && parsed.text && !messages.some(m => m.id === parsed.id)) {
              messages.push(parsed);
              saveMessagesToStorage();
              renderMessages();
              scrollChatToBottom();
              triggerReaction('⚡');
            }
          }
        } catch (err) {}
      };

      es.onerror = function() {
        setTimeout(fetchRemoteHistory, 10000);
      };
    } catch (err) {
      setInterval(fetchRemoteHistory, 8000);
    }
  }

  function getRelativeTime(timestamp) {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Scroll to bottom on initial load
  setTimeout(() => scrollChatToBottom(true), 250);
})();
