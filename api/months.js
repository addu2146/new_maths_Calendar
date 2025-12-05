// Vercel Serverless Function - /api/months
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const months = [
    { id: 1, name: 'January', mathematician: 'Srinivasa Ramanujan', theme: 'Number Properties' },
    { id: 2, name: 'February', mathematician: 'C.R. Rao', theme: 'Expressions with 2s' },
    { id: 3, name: 'March', mathematician: 'Shakuntala Devi', theme: 'Greek Numerical Prefixes' },
    { id: 4, name: 'April', mathematician: 'D.R. Kaprekar', theme: 'Mathematical Symbols' },
    { id: 5, name: 'May', mathematician: 'Aryabhata', theme: 'Powers & Exponents' },
    { id: 6, name: 'June', mathematician: 'Bhaskara II', theme: 'Geometry Facts' },
    { id: 7, name: 'July', mathematician: 'Brahmagupta', theme: 'Number Systems' },
    { id: 8, name: 'August', mathematician: 'Satyendra Nath Bose', theme: 'Physics Constants' },
    { id: 9, name: 'September', mathematician: 'P.C. Mahalanobis', theme: 'Statistics' },
    { id: 10, name: 'October', mathematician: 'Harish-Chandra', theme: 'Algebra' },
    { id: 11, name: 'November', mathematician: 'Manjul Bhargava', theme: 'Number Theory' },
    { id: 12, name: 'December', mathematician: 'Madhava of Sangamagrama', theme: 'Infinite Series' }
  ];

  // Return minimal data - full data is bundled client-side
  res.status(200).json({
    months,
    message: 'Full data available client-side'
  });
}
