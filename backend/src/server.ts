import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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


// Managers API - reads from local coaches.json file (no CORS, no 403 issues!)
app.get('/api/managers', (req, res) => {
  try {
    // استخدم process.cwd() بدلاً من __dirname لكي يقرأ الملف الصحيح بعد عمل build (dist) على Railway
    const dataPath = path.join(process.cwd(), 'src', 'data', 'coaches.json');
    if (!fs.existsSync(dataPath)) {
      return res.json({ coaches: [] });
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const allCoaches = JSON.parse(rawData);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = 15; // same limit as EFHub
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedCoaches = allCoaches.slice(startIndex, endIndex);
    
    res.json({
      page,
      totalPages: Math.ceil(allCoaches.length / limit),
      totalCoaches: allCoaches.length,
      coaches: paginatedCoaches
    });
  } catch (err) {
    console.error('Error reading coaches.json:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add New Coaches API
app.post('/api/managers/add', (req, res) => {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'data', 'coaches.json');
    let existingCoaches = [];
    if (fs.existsSync(dataPath)) {
      existingCoaches = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    let inputData = req.body;
    let newCoaches = [];
    if (inputData.coaches && Array.isArray(inputData.coaches)) {
      newCoaches = inputData.coaches;
    } else if (Array.isArray(inputData)) {
      newCoaches = inputData;
    } else if (typeof inputData === 'object' && inputData !== null) {
      newCoaches = [inputData];
    }

    if (newCoaches.length === 0) {
      return res.status(400).json({ error: 'لم يتم العثور على مدربين في البيانات المرسلة' });
    }

    const map = new Map();
    // نضع الجدد أولاً ليكونوا في أعلى الصفحة 1
    newCoaches.forEach((c: any) => { if(c.id) map.set(c.id, c) });
    // نضع القدامى
    existingCoaches.forEach((c: any) => {
      if (c.id && !map.has(c.id)) {
        map.set(c.id, c);
      }
    });

    const merged = Array.from(map.values());
    fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2));

    res.json({ success: true, message: `تمت إضافة ${newCoaches.length} مدرب بنجاح!`, totalCoaches: merged.length });
  } catch (err: any) {
    console.error('Error adding coaches:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة البيانات: ' + err.message });
  }
});

// --- CHAT SYSTEM ---
const chatDataPath = path.join(process.cwd(), 'src', 'data', 'chats.json');

app.get('/api/chat/messages', (req, res) => {
  try {
    const { userId } = req.query;
    if (!fs.existsSync(chatDataPath)) {
      return res.json([]);
    }
    const chats = JSON.parse(fs.readFileSync(chatDataPath, 'utf-8'));
    if (userId) {
      const userChats = chats.filter((c: any) => c.userId === userId);
      return res.json(userChats);
    }
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/chat/send', (req, res) => {
  try {
    const message = req.body;
    let chats = [];
    if (fs.existsSync(chatDataPath)) {
      chats = JSON.parse(fs.readFileSync(chatDataPath, 'utf-8'));
    }
    
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    
    chats.push(newMessage);
    fs.writeFileSync(chatDataPath, JSON.stringify(chats, null, 2));
    
    res.json({ success: true, message: 'تم إرسال الرسالة بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/chat/users', (req, res) => {
  try {
    if (!fs.existsSync(chatDataPath)) return res.json([]);
    const chats = JSON.parse(fs.readFileSync(chatDataPath, 'utf-8'));
    const usersMap = new Map();
    chats.forEach((c: any) => {
      if (!usersMap.has(c.userId)) {
        usersMap.set(c.userId, { userId: c.userId, userName: c.userName, lastMessage: c.text, timestamp: c.timestamp });
      } else {
        const u = usersMap.get(c.userId);
        if (c.timestamp > u.timestamp) {
          u.lastMessage = c.text;
          u.timestamp = c.timestamp;
        }
      }
    });
    res.json(Array.from(usersMap.values()).sort((a: any, b: any) => b.timestamp - a.timestamp));
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- IMAGE UPLOAD PROXY ---
app.post('/api/upload', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '64893796dcb70764722c0d575faeb0a9';
    let isSuccess = false;
    let uploadedUrl = '';
    let errorMessage = '';

    try {
      const formData = new FormData();
      formData.append('image', image);
      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const imgbbData = await imgbbRes.json();
      if (imgbbData.success) {
        uploadedUrl = imgbbData.data.url;
        isSuccess = true;
      } else {
        errorMessage = imgbbData.error?.message || 'ImgBB error';
      }
    } catch (e: any) {
      errorMessage = e.message;
    }

    if (!isSuccess) {
      try {
        const fallbackFormData = new FormData();
        fallbackFormData.append('source', image);
        fallbackFormData.append('key', '6d207e02198a847aa98d0a2a901485a5');
        
        const fallbackRes = await fetch('https://freeimage.host/api/1/upload', {
          method: 'POST',
          body: fallbackFormData
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData.status_code === 200) {
          uploadedUrl = fallbackData.image.url;
          isSuccess = true;
        }
      } catch (e: any) {
        console.error('Fallback error:', e);
      }
    }

    if (isSuccess) {
      res.json({ success: true, url: uploadedUrl });
    } else {
      res.status(500).json({ success: false, error: errorMessage || 'Failed to upload image' });
    }
  } catch (err: any) {
    console.error('Server upload error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`StreamHub API is running on http://localhost:${PORT}`);
});
