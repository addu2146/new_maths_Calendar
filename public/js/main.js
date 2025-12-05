// Mathematical Calendar - Entry Point
import MathCalendar from './calendar.js';

// Initialize calendar
const calendar = new MathCalendar();

// Try to fetch data from API (if available)
async function hydrateFromAPI() {
  try {
    const response = await fetch('/api/months');
    if (response.ok) {
      const data = await response.json();
      calendar.setData(data.months, data.data);
      console.log('Data hydrated from API');
    }
  } catch (e) {
    console.log('Using bundled data (API not available)');
  }
}

// Create floating background symbols
function createFloatingSymbols() {
  const symbols = ['π', 'Σ', '∞', '√', '∫', 'φ', 'θ', 'Δ', '∂', 'λ', 'μ', 'σ'];
  const container = document.querySelector('.floating-symbols');
  
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const symbol = document.createElement('span');
    symbol.className = 'float-symbol';
    symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    symbol.style.left = Math.random() * 100 + '%';
    symbol.style.animationDelay = Math.random() * 20 + 's';
    symbol.style.animationDuration = (15 + Math.random() * 20) + 's';
    symbol.style.fontSize = (1 + Math.random() * 2) + 'rem';
    symbol.style.opacity = 0.1 + Math.random() * 0.2;
    container.appendChild(symbol);
  }
}

// Initialize
async function init() {
  await hydrateFromAPI();
  calendar.init();
  createFloatingSymbols();
  
  // Triple-click title for rainbow mode
  let titleClicks = 0;
  let titleTimer = null;
  document.addEventListener('click', (e) => {
    if (e.target.closest('.month-title')) {
      titleClicks++;
      clearTimeout(titleTimer);
      titleTimer = setTimeout(() => titleClicks = 0, 500);
      
      if (titleClicks >= 3) {
        document.body.classList.toggle('rainbow-mode');
        titleClicks = 0;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
