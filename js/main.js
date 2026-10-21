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
//   COMMUNITY CHAT SPACE (REAL-TIME ENGINE)
// =============================================
(function initCommunityChat() {
  const CHAT_TOPIC = 'dreamscape_gaming_cafe_live_chat';
  const CHAT_URL = `https://ntfy.sh/${CHAT_TOPIC}`;
  const STORAGE_KEY = 'dreamscape_chat_messages_v1';
  const UPVOTES_KEY = 'dreamscape_chat_upvotes_v1';
  const USER_KEY = 'dreamscape_chat_username';

  const chatMessagesEl = document.getElementById('chatMessages');
  const chatFormEl = document.getElementById('chatForm');
  const chatNameEl = document.getElementById('chatName');
  const chatMsgEl = document.getElementById('chatMsg');
  const chatCategoryEl = document.getElementById('chatCategory');
  const chatMsgCountEl = document.getElementById('chatMsgCount');
  const charCounterEl = document.getElementById('charCounter');
  const filterPills = document.querySelectorAll('.filter-pill');

  if (!chatMessagesEl || !chatFormEl) return;

  let activeFilter = 'All';
  let messages = [];
  let userUpvotes = new Set(JSON.parse(localStorage.getItem(UPVOTES_KEY) || '[]'));

  // Load saved user name
  const savedName = localStorage.getItem(USER_KEY);
  if (savedName && chatNameEl) {
    chatNameEl.value = savedName;
  }

  // Character counter
  if (chatMsgEl && charCounterEl) {
    chatMsgEl.addEventListener('input', () => {
      const remaining = 300 - chatMsgEl.value.length;
      charCounterEl.textContent = `${remaining} left`;
    });
  }

  // Default seed messages so chat is lively right away
  const defaultSeeds = [
    {
      id: 'seed-1',
      name: 'Basil (Founder)',
      isFounder: true,
      tag: 'Announcement',
      text: 'Welcome to the Dreamscape community chat space! Drop your gadget recommendations, game requests, or cafe design ideas below. We read everything!',
      time: Date.now() - 3600000 * 5,
      upvotes: 24
    },
    {
      id: 'seed-2',
      name: 'CyberPhantom',
      tag: 'Gadgets',
      text: 'Please make sure to get 240Hz+ IPS or OLED monitors for competitive shooters. 144Hz is okay, but 240Hz makes a huge difference in Valorant and CS2!',
      time: Date.now() - 3600000 * 3,
      upvotes: 18
    },
    {
      id: 'seed-3',
      name: 'Aiden_Plays',
      tag: 'Games',
      text: 'Host weekly 5v5 tournaments for Valorant & Rocket League with winner prizes or free cafe gaming passes!',
      time: Date.now() - 3600000 * 2,
      upvotes: 14
    },
    {
      id: 'seed-4',
      name: 'NeonVibe',
      tag: 'Design',
      text: 'The cyberpunk dark aesthetic with purple and cyan ambient lighting will look insane. Add soundproof gaming booths if possible!',
      time: Date.now() - 1800000,
      upvotes: 11
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
    scrollChatToBottom();

    chatMsgEl.value = '';
    if (charCounterEl) charCounterEl.textContent = '300 left';
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
      chatMsgCountEl.textContent = `${messages.length} message${messages.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      chatMessagesEl.innerHTML = `
        <div class="chat-loading">
          <div style="font-size:2.5rem;margin-bottom:0.5rem">💭</div>
          <p>No messages in <strong>${escapeHtml(activeFilter)}</strong> yet. Be the first to post!</p>
        </div>
      `;
      return;
    }

    const currentUserName = (chatNameEl ? chatNameEl.value : '').trim().toLowerCase();

    chatMessagesEl.innerHTML = filtered.map(m => {
      const isUpvoted = userUpvotes.has(m.id);
      const isOwn = currentUserName && m.name.toLowerCase() === currentUserName;
      const initial = (m.name || 'G').trim().charAt(0).toUpperCase();
      const timeStr = formatTime(m.time);

      return `
        <div class="chat-bubble ${isOwn ? 'own' : ''} ${m.isFounder ? 'featured-founder' : ''}" data-id="${m.id}">
          <div class="bubble-avatar ${m.isFounder ? 'founder' : ''}">${m.isFounder ? '👑' : initial}</div>
          <div class="bubble-body">
            <div class="bubble-header">
              <span class="bubble-name">${escapeHtml(m.name)}</span>
              ${m.isFounder ? '<span class="bubble-founder-badge">Founder</span>' : ''}
              <span class="bubble-tag ${m.tag}">${escapeHtml(m.tag || 'Ideas')}</span>
              <span class="bubble-time">${timeStr}</span>
            </div>
            <div class="bubble-text">${escapeHtml(m.text)}</div>
            <div class="bubble-actions">
              <button type="button" class="upvote-btn ${isUpvoted ? 'upvoted' : ''}" onclick="upvoteMessage('${m.id}')">
                <i class="${isUpvoted ? 'fas' : 'far'} fa-heart"></i>
                <span>${m.upvotes || 0}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function scrollChatToBottom() {
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  function saveMessagesToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
    } catch (e) {}
  }

  // Fetch recent messages from remote server
  async function fetchRemoteHistory() {
    try {
      const res = await fetch(`${CHAT_URL}/json?poll=1&since=24h`);
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
            }
          }
        } catch (err) {}
      };

      es.onerror = function() {
        // Fallback: poll every 10 seconds if SSE disconnects
        setTimeout(fetchRemoteHistory, 10000);
      };
    } catch (err) {
      setInterval(fetchRemoteHistory, 8000);
    }
  }

  function formatTime(timestamp) {
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
  setTimeout(scrollChatToBottom, 200);
})();
