import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client'; // Uncomment when prisma client is generated

dotenv.config();

const app = express();
// const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

// Basic Routes Structure for StreamHub

// --- AUTH & ROLES ---
app.post('/api/auth/register', (req, res) => {
  // TODO: Create user, hash password, return JWT
  res.json({ message: 'User registered successfully' });
});

app.post('/api/auth/login', (req, res) => {
  // TODO: Validate credentials, return JWT & user details
  res.json({ token: 'mock-jwt-token', user: { name: 'Streamer 1', role: 'STREAMER' } });
});

app.get('/api/auth/me', (req, res) => {
  // TODO: Return current user based on JWT
  res.json({ user: { name: 'Streamer 1', role: 'STREAMER', coinsBalance: 5000 } });
});


// --- COINS & WALLET ---
app.get('/api/wallet/balance', (req, res) => {
  res.json({ coinsBalance: 5000, cashBalance: 0 });
});

app.post('/api/wallet/convert', (req, res) => {
  // TODO: Create a CASH_OUT_REQUEST transaction
  res.json({ success: true, message: 'Cash out request submitted successfully.' });
});


// --- STREAMER DASHBOARD ---
app.get('/api/streamer/stats', (req, res) => {
  res.json({
    views: 12500,
    likes: 4300,
    streamHours: 12.5
  });
});

app.post('/api/streamer/upload-link', (req, res) => {
  const { link } = req.body;
  // TODO: Analyze the link (e.g. TikTok)
  res.json({ success: true, message: 'Link analyzed successfully', data: { extraViews: 500 } });
});


// --- LEADERBOARDS & CONTESTS ---
app.get('/api/leaderboards/top-streamers', (req, res) => {
  res.json([
    { id: '1', name: 'أحمد جيمنج', coins: 50000, rank: 1 },
    { id: '2', name: 'عمر برو', coins: 42000, rank: 2 }
  ]);
});

app.post('/api/contests/distribute-rewards', (req, res) => {
  // TODO: Admin or cron job to distribute coins to top users
  res.json({ success: true, message: 'Rewards distributed.' });
});


// --- ADMIN DASHBOARD ---
app.get('/api/admin/transactions', (req, res) => {
  res.json([
    { id: 't1', userId: 'u1', amount: 1000, type: 'CASH_OUT_REQUEST', status: 'PENDING' }
  ]);
});

app.put('/api/admin/transactions/:id/status', (req, res) => {
  const { status } = req.body; // APPROVED or REJECTED
  // TODO: Update transaction and user cashBalance
  res.json({ success: true, message: `Transaction marked as ${status}` });
});


// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to StreamHub API 🚀' });
});

// Managers API (Mock/Placeholder for frontend fetch)
app.get('/api/managers', (req, res) => {
  res.json([]);
});

// Proxy for EFHub API to avoid CORS issues from free proxies
app.get('/api/proxy/coaches', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const response = await fetch(`https://efhub.com/api/public/coaches?page=${page}`);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from EFHub' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error fetching coaches' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`StreamHub API is running on http://localhost:${PORT}`);
});
