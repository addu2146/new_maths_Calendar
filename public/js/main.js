// Mathematical Calendar - Entry Point
import MathCalendar from './calendar.js';

// Initialize calendar
const calendar = new MathCalendar();

const API_URL = window.MATH_API_URL || '/api/months';

// Try to fetch data from API (if available)
async function hydrateFromAPI() {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const data = await response.json();
      calendar.setData(data.months, data.data);
      console.log('Data hydrated from API');
    }
  } catch (e) {
    console.log('Using bundled data (API not available)');
  }
}

// Initialize
async function init() {
  await hydrateFromAPI();
  calendar.init();
  
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
