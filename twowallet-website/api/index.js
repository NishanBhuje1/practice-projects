const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'waitlist.json');

app.use(cors());
app.use(express.json());

// Ensure waitlist.json exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ emails: [] }, null, 2));
}

app.post('/api/waitlist', (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email required' });
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  if (data.emails.includes(email)) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  data.emails.push(email);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

  console.log(`[waitlist] New signup: ${email} (total: ${data.emails.length})`);

  res.json({ success: true, message: "You're on the list!" });
});

app.get('/api/waitlist/count', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  res.json({ count: data.emails.length });
});

module.exports = app;