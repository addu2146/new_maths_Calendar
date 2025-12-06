// Mathematical Calendar - Core Logic
import { DEFAULT_MONTHS, DEFAULT_DATA } from './data.js';

const GEMINI_URL = window.GEMINI_API_URL || '/api/gemini';

class MathCalendar {
  constructor() {
    this.months = DEFAULT_MONTHS;
    this.data = DEFAULT_DATA;
    this.currentMonth = new Date().getMonth() + 1;
    this.progress = this._loadProgress();
    this.streak = this._calculateStreak();
    this.artPalettes = [
      ['#ff7b54', '#ffd166'],
      ['#6dd3ff', '#8ec5fc'],
      ['#a18cd1', '#fbc2eb'],
      ['#ff9a9e', '#fad0c4'],
      ['#84fab0', '#8fd3f4'],
      ['#fddb92', '#d1fdff'],
      ['#f6d365', '#fda085'],
      ['#cfd9df', '#e2ebf0'],
      ['#fbc2eb', '#a6c1ee'],
      ['#ffd3a5', '#fd6585'],
      ['#a8edea', '#fed6e3'],
      ['#ffecd2', '#fcb69f']
    ];
    this.monthEmojis = ['✨','📚','🧠','🎨','🎯','🚀','🧩','🌈','🔭','🧮','🧪','🎁'];
    
    this._bindElements();
    this._setupEventListeners();
  }

  setData(months, data) {
    if (months) this.months = months;
    if (data) this.data = data;
  }

  _bindElements() {
    this.navBar = document.querySelector('.nav-bar');
    this.headerCard = document.querySelector('.header-card');
    this.calendarGrid = document.querySelector('.calendar-grid');
    this.modal = document.querySelector('.modal-overlay');
    this.modalContent = document.querySelector('.modal-content');
    this.progressBar = document.querySelector('.progress-fill');
    this.streakCount = document.querySelector('.streak-count');
    this.completedCount = document.querySelector('.completed-count');
  }

  _setupEventListeners() {
    // Close modal
    document.querySelector('.modal-close')?.addEventListener('click', () => this._closeModal());
    this.modal?.addEventListener('click', (e) => {
      if (e.target === this.modal) this._closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._closeModal();
    });

    // Easter eggs
    this._setupEasterEggs();
  }

  _setupEasterEggs() {
    // Konami code
    const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let konamiIndex = 0;
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === konami[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konami.length) {
          document.body.classList.toggle('disco-mode');
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });

    // 100 clicks party mode
    let clickCount = 0;
    document.addEventListener('click', () => {
      clickCount++;
      if (clickCount === 100) {
        document.body.classList.add('party-mode');
        setTimeout(() => document.body.classList.remove('party-mode'), 5000);
        clickCount = 0;
      }
    });
  }

  init() {
    this._renderNav();
    this._renderMonth(this.currentMonth);
    this._updateStats();
    this._populateFloatingSymbols();
  }

  _populateFloatingSymbols() {
    const container = document.querySelector('.floating-symbols');
    if (!container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const smallScreen = window.innerWidth < 640;
    const sprites = ['✦', '✧', '❖', '⌁', '∞', 'π', '÷', '×', '∑', '√', '☆', '⚡', '🎲', '🧩'];
    const count = reduceMotion ? 10 : smallScreen ? 12 : 18;

    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'float-symbol';
      span.textContent = sprites[i % sprites.length];

      const size = (Math.random() * 1.1 + 0.9).toFixed(2);
      const left = Math.random() * 100;
      const delay = Math.random() * 18;
      const duration = Math.random() * 16 + 18;
      const opacity = (Math.random() * 0.35 + 0.25).toFixed(2);

      span.style.left = `${left}%`;
      span.style.fontSize = `${size}rem`;
      span.style.animationDelay = `${delay}s`;
      span.style.animationDuration = `${duration}s`;
      span.style.opacity = opacity;

      container.appendChild(span);
    }
  }

  _renderNav() {
    const buttonsHtml = this.months.map(m => `
      <button class="nav-btn ${m.id === this.currentMonth ? 'active' : ''}" data-month="${m.id}">
        ${m.name.slice(0, 3)}
      </button>
    `).join('');
    
    this.navBar.innerHTML = `<div class="nav-buttons">${buttonsHtml}</div>`;
    
    this.navBar.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentMonth = parseInt(btn.dataset.month);
        this._renderNav();
        this._renderMonth(this.currentMonth);
      });
    });
  }

  _renderMonth(monthId) {
    const month = this.months.find(m => m.id === monthId);
    const days = this.data[monthId] || [];
    const palette = this.artPalettes[(monthId - 1) % this.artPalettes.length];
    const [c1, c2] = palette;
    const art = this._buildHeroArt(month);
    const badge = this.monthEmojis[(monthId - 1) % this.monthEmojis.length];
    
    // Header
    this.headerCard.innerHTML = `
      <div class="month-hero">
        <div class="math-art large" style="background: radial-gradient(circle at 30% 30%, ${c1}, ${c2}); box-shadow: 0 18px 48px ${c1}55;">
          ${art}
        </div>
        <div class="month-meta">
          <div class="month-title-row"><span class="month-emoji">${badge}</span><h1 class="month-title">${month.name}</h1></div>
          <p class="mathematician">Featuring: ${month.mathematician}</p>
          <p class="theme">Theme: ${month.theme}</p>
        </div>
      </div>
    `;

    // Calendar grid
    const daysHtml = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      .map(d => `<div class="day-header">${d}</div>`).join('');
    
    // Calculate starting day
    const firstDay = new Date(2025, monthId - 1, 1).getDay();
    const emptyDays = Array(firstDay).fill('<div class="day-cell empty"></div>').join('');
    
    const dayCells = days.map((day, i) => {
      const dayNum = i + 1;
      const isCompleted = this._isCompleted(monthId, dayNum);
      const isToday = this._isToday(monthId, dayNum);
      
      return `
        <div class="day-cell ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''}" 
             data-month="${monthId}" data-day="${dayNum}">
          <span class="day-number">${dayNum}</span>
          <span class="day-preview">${day.t}</span>
          ${isCompleted ? '<span class="check-badge">✓</span>' : ''}
        </div>
      `;
    }).join('');

    this.calendarGrid.innerHTML = daysHtml + emptyDays + dayCells;
    
    // Add click handlers
    this.calendarGrid.querySelectorAll('.day-cell:not(.empty)').forEach(cell => {
      cell.addEventListener('click', () => {
        const month = parseInt(cell.dataset.month);
        const day = parseInt(cell.dataset.day);
        this._openDay(month, day);
      });
    });
  }

  _buildHeroArt(month) {
    const symbolSets = [
      ['π', '∞', '∑', '√'],
      ['Δ', 'θ', 'λ', 'φ'],
      ['∫', '∂', 'σ', 'μ'],
      ['⊕', '⊗', '≈', '≠'],
      ['α', 'β', 'γ', 'Ω'],
      ['√2', 'φ', 'ℵ₀', 'e'],
      ['∇', '↺', '↻', '⇄'],
      ['★', '✦', '✧', '✩'],
      ['○', '◇', '⬟', '⬢'],
      ['✿', '❀', '❁', '❃'],
      ['♛', '♜', '♝', '♞'],
      ['♪', '♩', '♫', '♬']
    ];
    const idx = (month.id - 1) % symbolSets.length;
    const symbols = symbolSets[idx];

    return `
      <div class="math-art-orbit">
        <span>${symbols[0]}</span>
        <span>${symbols[1]}</span>
        <span>${symbols[2]}</span>
        <span>${symbols[3]}</span>
      </div>
      <div class="math-art-core big">${month.name.charAt(0)}</div>
      <div class="math-art-ring"></div>
    `;
  }

  _openDay(monthId, dayNum) {
    const dayData = this.data[monthId]?.[dayNum - 1];
    if (!dayData) return;

    const isCompleted = this._isCompleted(monthId, dayNum);
    
    this.modalContent.innerHTML = `
      <div class="modal-header">
        <h2 class="modal-day">Day ${dayNum}</h2>
        <h3 class="modal-topic">${dayData.t}</h3>
      </div>
      <div class="modal-body">
        <p class="question">${dayData.q}</p>
        <div class="choices" id="choices-container"></div>
        <div class="feedback" id="feedback"></div>
      </div>
      <div class="modal-footer">
        <div class="ai-buttons">
          <button class="ai-btn hint-btn" data-action="hint">💡 Hint</button>
          <button class="ai-btn explain-btn" data-action="explain">📚 Explain</button>
          <button class="ai-btn context-btn" data-action="context">🔍 Context</button>
        </div>
      </div>
    `;

    this._renderChoices(dayData, monthId, dayNum, isCompleted);
    this._setupAIButtons(dayData);
    
    this.modal.classList.add('active');
    this._createSparkles();
  }

  _renderChoices(dayData, monthId, dayNum, isCompleted) {
    const container = document.getElementById('choices-container');
    const shuffled = this._shuffleArray([...dayData.choices]);
    
    container.innerHTML = shuffled.map(choice => `
      <button class="choice-btn ${isCompleted && choice === dayData.a ? 'correct' : ''}" 
              data-choice="${choice}" ${isCompleted ? 'disabled' : ''}>
        ${choice}
      </button>
    `).join('');

    if (!isCompleted) {
      container.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this._handleChoiceClick(btn, dayData, monthId, dayNum);
        });
      });
    } else {
      document.getElementById('feedback').innerHTML = '<p class="already-completed">✓ Already completed!</p>';
    }
  }

  _handleChoiceClick(btn, dayData, monthId, dayNum) {
    const choice = btn.dataset.choice;
    const feedback = document.getElementById('feedback');
    const container = document.getElementById('choices-container');
    
    // Disable all buttons
    container.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);

    if (choice === dayData.a) {
      btn.classList.add('correct');
      feedback.innerHTML = '<p class="correct-feedback">🎉 Correct! Well done!</p>';
      this._markCompleted(monthId, dayNum);
      this._celebrateCorrect();
      this._updateStats();
      
      // Update the calendar cell
      const cell = this.calendarGrid.querySelector(`[data-month="${monthId}"][data-day="${dayNum}"]`);
      if (cell) {
        cell.classList.add('completed');
        if (!cell.querySelector('.check-badge')) {
          cell.innerHTML += '<span class="check-badge">✓</span>';
        }
      }
    } else {
      btn.classList.add('incorrect');
      // Highlight correct answer
      container.querySelectorAll('.choice-btn').forEach(b => {
        if (b.dataset.choice === dayData.a) {
          b.classList.add('correct');
        }
      });
      feedback.innerHTML = `<p class="incorrect-feedback">Not quite! The answer is: <strong>${dayData.a}</strong></p>`;
    }
  }

  _setupAIButtons(dayData) {
    let explainRevealed = false;

    document.querySelectorAll('.ai-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const feedback = document.getElementById('feedback');
        
        switch(action) {
          case 'hint': {
            feedback.innerHTML = '<p class="ai-response">💫 Thinking of a friendly hint...</p>';
            this._callGemini(`You are writing for a cheerful 10-year-old. Give one playful hint (no answer!) for this math question. Keep it short, encouraging, and use simple words. Question: ${dayData.q}. Topic: ${dayData.t}. Do NOT give the answer.`)
              .then(text => feedback.innerHTML = `<p class="ai-response">💡 ${text}</p>`)
              .catch(() => feedback.innerHTML = '<p class="ai-response">⚠️ Hint not available right now. Try again!</p>');
            break;
          }
          case 'explain': {
            if (!explainRevealed) {
              feedback.innerHTML = `
                <div class="peek-warning">
                  <p>🚦 Peek alert! If you view the answer now, this question won't count as completed until you solve it yourself.</p>
                  <button class="peek-btn" id="reveal-answer">Reveal anyway</button>
                </div>
              `;
              document.getElementById('reveal-answer')?.addEventListener('click', () => {
                explainRevealed = true;
                feedback.innerHTML = '<p class="ai-response">💫 Getting your explanation...</p>';
                this._callGemini(`You are explaining to a fun-loving 10-year-old. Explain the math idea, then reveal the correct answer once at the end. Keep it short, playful, and clear. Question: ${dayData.q}. Topic: ${dayData.t}. Correct answer: ${dayData.a}.`)
                  .then(text => feedback.innerHTML = `<p class="ai-response">📚 ${text}</p>`)
                  .catch(() => feedback.innerHTML = '<p class="ai-response">⚠️ Explanation not available right now. Try again!</p>');
              });
              break;
            }
            feedback.innerHTML = '<p class="ai-response">💫 Getting your explanation...</p>';
            this._callGemini(`You are explaining to a fun-loving 10-year-old. Explain the math idea, then reveal the correct answer once at the end. Keep it short, playful, and clear. Question: ${dayData.q}. Topic: ${dayData.t}. Correct answer: ${dayData.a}.`)
              .then(text => feedback.innerHTML = `<p class="ai-response">📚 ${text}</p>`)
              .catch(() => feedback.innerHTML = '<p class="ai-response">⚠️ Explanation not available right now. Try again!</p>');
            break;
          }
          case 'context': {
            const month = this.months.find(m => m.id === this.currentMonth);
            feedback.innerHTML = '<p class="ai-response">💫 Fetching a fun fact...</p>';
            this._callGemini(`You are talking to a curious 10-year-old. Share one fun, 1-2 sentence fact about ${month?.mathematician} and the theme ${month?.theme}. Keep it playful, simple, and upbeat.`)
              .then(text => feedback.innerHTML = `<p class="ai-response">🔍 ${text}</p>`)
              .catch(() => feedback.innerHTML = '<p class="ai-response">⚠️ Context not available right now. Try again!</p>');
            break;
          }
        }
      });
    });
  }

  async _callGemini(prompt) {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Gemini failed: bad JSON');
    }
    if (!response.ok) {
      const msg = data?.error || 'Gemini failed';
      throw new Error(msg);
    }
    return data.text || 'No response.';
  }

  _closeModal() {
    this.modal.classList.remove('active');
  }

  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  _isCompleted(monthId, dayNum) {
    return this.progress[`${monthId}-${dayNum}`] === true;
  }

  _isToday(monthId, dayNum) {
    const today = new Date();
    return today.getMonth() + 1 === monthId && today.getDate() === dayNum;
  }

  _markCompleted(monthId, dayNum) {
    this.progress[`${monthId}-${dayNum}`] = true;
    this._saveProgress();
    this.streak = this._calculateStreak();
  }

  _loadProgress() {
    try {
      return JSON.parse(localStorage.getItem('mathCalendarProgress')) || {};
    } catch {
      return {};
    }
  }

  _saveProgress() {
    localStorage.setItem('mathCalendarProgress', JSON.stringify(this.progress));
  }

  _calculateStreak() {
    // Simple streak calculation - count consecutive completed days
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const month = checkDate.getMonth() + 1;
      const day = checkDate.getDate();
      
      if (this.progress[`${month}-${day}`]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }

  _updateStats() {
    const completed = Object.keys(this.progress).filter(k => this.progress[k]).length;
    const total = Object.values(this.data).reduce((sum, month) => sum + month.length, 0);
    const percent = Math.round((completed / total) * 100);
    
    if (this.progressBar) {
      this.progressBar.style.width = `${percent}%`;
    }
    if (this.streakCount) {
      this.streakCount.textContent = this.streak;
    }
    if (this.completedCount) {
      this.completedCount.textContent = completed;
    }

    // Check for badges
    this._checkBadges(completed);
  }

  _checkBadges(completed) {
    const badges = [10, 25, 50, 100, 200, 365];
    badges.forEach(threshold => {
      if (completed >= threshold && !localStorage.getItem(`badge-${threshold}`)) {
        localStorage.setItem(`badge-${threshold}`, 'true');
        this._showBadgeNotification(threshold);
      }
    });
  }

  _showBadgeNotification(count) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `🏆 Badge Unlocked: ${count} Problems Solved!`;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  _celebrateCorrect() {
    // Confetti effect
    for (let i = 0; i < 30; i++) {
      setTimeout(() => this._createConfetti(), i * 50);
    }
  }

  _createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
    confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 4000);
  }

  _createSparkles() {
    const modalRect = this.modalContent.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = (modalRect.left + Math.random() * modalRect.width) + 'px';
        sparkle.style.top = (modalRect.top + Math.random() * modalRect.height) + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
      }, i * 100);
    }
  }
}

export default MathCalendar;
