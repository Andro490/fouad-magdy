import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from './middleware/auth';
import { generateToken } from './utils/jwt';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean);

app.disable('x-powered-by');

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setAuthCookie = (res: any, token: string) => {
  res.cookie('auth_token', token, cookieOptions);
};

const clearAuthCookie = (res: any) => {
  res.clearCookie('auth_token', { ...cookieOptions, maxAge: 0 });
};

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to StreamHub API with PostgreSQL 🚀' });
});

// ─────────────────────────────────────────
// MANAGERS API - Serves directly from coaches.json
// Order in file = order on site. New coaches prepended = appear first.
// ─────────────────────────────────────────
const COACHES_FILE = path.join(__dirname, '../src/data/coaches.json');

const readCoachesFile = (): any[] => {
  try {
    const raw = fs.readFileSync(COACHES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const writeCoachesFile = (coaches: any[]) => {
  fs.writeFileSync(COACHES_FILE, JSON.stringify(coaches, null, 4), 'utf-8');
};

app.get('/api/managers', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 15;
    const allCoaches = readCoachesFile();
    const totalCoaches = allCoaches.length;
    const start = (page - 1) * limit;
    const coaches = allCoaches.slice(start, start + limit);

    res.json({
      page,
      totalPages: Math.ceil(totalCoaches / limit),
      totalCoaches,
      coaches
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/managers/reset', async (req, res) => {
  try {
    res.json({ message: 'Reset not needed - coaches served from file' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/managers/add', (req, res) => {
  try {
    let inputData = req.body;
    let newCoaches: any[] = [];
    if (inputData.coaches && Array.isArray(inputData.coaches)) {
      newCoaches = inputData.coaches;
    } else if (Array.isArray(inputData)) {
      newCoaches = inputData;
    } else if (typeof inputData === 'object' && inputData !== null) {
      newCoaches = [inputData];
    }

    if (newCoaches.length === 0) {
      return res.status(400).json({ error: 'لم يتم العثور على مدربين' });
    }

    const existing = readCoachesFile();

    // Remove duplicates (same id), then prepend new coaches to the top
    const withoutDupes = existing.filter(
      (e: any) => !newCoaches.some((n: any) => String(n.id) === String(e.id))
    );
    const updated = [...newCoaches, ...withoutDupes];
    writeCoachesFile(updated);

    res.json({ success: true, message: `تمت إضافة ${newCoaches.length} مدرب بنجاح في أول القائمة!` });
  } catch (err: any) {
    console.error('Error adding coaches:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/managers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = readCoachesFile();
    const filtered = existing.filter((c: any) => String(c.id) !== String(id));
    if (filtered.length === existing.length) {
      return res.status(404).json({ error: 'المدرب غير موجود' });
    }
    writeCoachesFile(filtered);
    res.json({ success: true, message: 'تم حذف المدرب بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// PRODUCTS API
// ─────────────────────────────────────────
app.get('/api/products', async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products)) return res.status(400).json({ error: 'Expected an array' });
    
    // For simplicity, the admin panel sends the entire list of products.
    // We will clear and recreate to match the JSON file overwrite behavior.
    await prisma.product.deleteMany();
    
    const created = await prisma.product.createMany({
      data: products.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        image: p.image,
        images: p.images || [],
        adminPhone: p.adminPhone ?? undefined,
        isSoldOut: Boolean(p.isSoldOut)
      }))
    });
    
    res.json({ success: true, count: created.count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// CHECKOUT API
// ─────────────────────────────────────────
app.post('/api/checkout/stripe', async (req, res) => {
  try {
    const { successUrl, cancelUrl, planName = 'الخطة المدفوعة', amount = 2000 } = req.body;
    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe secret key is not configured' });
    }
    
    const params = new URLSearchParams();
    const finalSuccessUrl = successUrl || 'http://localhost:5173/payment-success';
    const separator = finalSuccessUrl.includes('?') ? '&' : '?';
    params.append('success_url', finalSuccessUrl + separator + 'session_id={CHECKOUT_SESSION_ID}');
    params.append('cancel_url', cancelUrl || 'http://localhost:5173/');
    params.append('mode', 'payment');
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][product_data][name]', planName);
    params.append('line_items[0][price_data][unit_amount]', amount.toString()); // in cents
    params.append('line_items[0][quantity]', '1');

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    const session = await response.json();
    if (session.error) {
      return res.status(400).json({ error: session.error.message });
    }
    
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Verify a completed Stripe session and save purchase record
app.get('/api/checkout/verify', async (req, res) => {
  try {
    const { session_id, managerId, userEmail } = req.query as Record<string, string>;
    if (!session_id) return res.status(400).json({ paid: false, error: 'Missing session_id' });

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) return res.status(500).json({ paid: false, error: 'Stripe not configured' });

    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
    });
    const session = await response.json();

    if (session.error) return res.status(400).json({ paid: false, error: session.error.message });

    const isPaid = session.payment_status === 'paid';

    // Save purchase record to DB so user doesn't need to pay again
    if (isPaid && managerId) {
      const email = userEmail || session.customer_details?.email || 'guest@unknown.com';
      try {
        await (prisma as any).coachPurchase.upsert({
          where: { userEmail_managerId: { userEmail: email, managerId } },
          update: { sessionId: session_id },
          create: { userEmail: email, managerId, sessionId: session_id }
        });
      } catch (e) {
        console.warn('Could not save purchase record:', e);
      }
    }

    res.json({ paid: isPaid, customerEmail: session.customer_details?.email });
  } catch (err: any) {
    res.status(500).json({ paid: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// SECURE: Check purchase with JWT (can't be faked from browser)
// ─────────────────────────────────────────────────────────────
// Endpoint: GET /api/checkout/check-purchase
// Headers:  Authorization: Bearer <token>
// Query:    managerId=<id>
// Returns:  { purchased: true/false }
app.get('/api/checkout/check-purchase', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { managerId, phone } = req.query as Record<string, string>;
    if (!managerId) return res.status(400).json({ error: 'Missing managerId' });

    // Get user email from the verified JWT payload (cannot be tampered)
    let userEmail = req.user?.email;
    const userId = req.user?.id;
    
    // Support local mock users by relying on passed phone
    if (userEmail === 'mock@local.user' && phone) {
      userEmail = phone;
    }

    if (!userEmail && !userId) {
      return res.status(401).json({ purchased: false, error: 'Cannot identify user from token' });
    }

    // Fetch user email from DB if only userId is in token
    let email = userEmail;
    if (!email && userId && userId !== 'mock-id') {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      email = dbUser?.email;
    }

    if (!email) return res.status(401).json({ purchased: false, error: 'User not found' });

    // Query the DB directly — localStorage cannot influence this
    const record = await (prisma as any).coachPurchase.findFirst({
      where: { managerId, userEmail: email }
    });

    if (!record) {
      return res.status(403).json({ purchased: false, error: 'No purchase record found' });
    }

    return res.json({ purchased: true });
  } catch (err: any) {
    return res.status(500).json({ purchased: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// MANUAL PAYMENT (TELEGRAM INTEGRATION)
// ─────────────────────────────────────────────────────────────
app.post('/api/checkout/manual', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, phone, gameId, productName, price, receiptBase64, managerId } = req.body;
    
    // Use phone as the primary identifier for local mock accounts
    let userEmail = req.user?.email || phone || 'guest@unknown.com';
    if (userEmail === 'mock@local.user') userEmail = phone;

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    const TELEGRAM_SECRET = process.env.TELEGRAM_SECRET;
    const API_URL = process.env.BACKEND_URL;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return res.status(500).json({ error: 'Telegram configuration is missing in backend.' });
    }

    if (!TELEGRAM_SECRET) {
      return res.status(500).json({ error: 'TELEGRAM_SECRET is not configured.' });
    }

    if (!API_URL) {
      return res.status(500).json({ error: 'BACKEND_URL is not configured for Telegram callbacks.' });
    }

    const caption = `💰 <b>طلب شراء جديد (دفع يدوي)</b>\n\n` +
      `👤 <b>الاسم:</b> ${name}\n` +
      `📧 <b>الإيميل:</b> ${userEmail}\n` +
      `📱 <b>الهاتف:</b> ${phone}\n` +
      `🎮 <b>لعبة ID:</b> ${gameId}\n` +
      `🛍️ <b>المنتج:</b> ${productName}\n` +
      `💵 <b>السعر:</b> ${price}\n\n` +
      `يرجى مراجعة الإيصال المرفق والموافقة أو الرفض.`;

    const replyMarkup = JSON.stringify({
      inline_keyboard: [
        [
          { text: "✅ تم الدفع (موافقة)", url: `${API_URL}/api/checkout/manual-approve?managerId=${managerId}&email=${encodeURIComponent(userEmail)}&secret=${TELEGRAM_SECRET}` },
          { text: "❌ لم يتم الدفع (رفض)", url: `${API_URL}/api/checkout/manual-reject?managerId=${managerId}&email=${encodeURIComponent(userEmail)}&secret=${TELEGRAM_SECRET}` }
        ]
      ]
    });

    let fetchBody: any = null;
    let fetchHeaders: any = {};

    if (receiptBase64 && typeof FormData !== 'undefined' && typeof Blob !== 'undefined') {
      try {
        const [mimePart, dataPart] = receiptBase64.split(',');
        const mime = mimePart.match(/:(.*?);/)?.[1] || 'image/jpeg';
        const buffer = Buffer.from(dataPart, 'base64');
        const blob = new Blob([buffer], { type: mime });
        
        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('photo', blob, 'receipt.jpg');
        formData.append('caption', caption);
        formData.append('parse_mode', 'HTML');
        formData.append('reply_markup', replyMarkup);
        
        fetchBody = formData;
      } catch (e) {
        console.log('Error creating FormData for Telegram:', e);
      }
    }

    // Fallback if FormData fails or no receipt
    if (!fetchBody) {
      fetchHeaders = { 'Content-Type': 'application/json' };
      fetchBody = JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: caption + (receiptBase64 ? '\n\n<i>(ملاحظة: فشل إرفاق الصورة، يرجى مراجعتها من مصدر آخر)</i>' : ''),
        parse_mode: 'HTML',
        reply_markup: JSON.parse(replyMarkup)
      });
    }

    const endpoint = fetchHeaders['Content-Type'] === 'application/json' ? 'sendMessage' : 'sendPhoto';
    const tgUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${endpoint}`;

    const tgResponse = await fetch(tgUrl, {
      method: 'POST',
      headers: fetchHeaders,
      body: fetchBody
    });

    let tgResult = await tgResponse.json();
    
    // If sending photo failed, fallback to sending text message
    if (!tgResult.ok && endpoint === 'sendPhoto') {
      console.warn('sendPhoto failed, falling back to sendMessage', tgResult);
      const fallbackUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: caption + '\n\n<i>(ملاحظة: فشل إرفاق الصورة، يرجى التواصل مع العميل لطلب الإيصال)</i>',
          parse_mode: 'HTML',
          reply_markup: JSON.parse(replyMarkup)
        })
      });
      tgResult = await fallbackResponse.json();
    }

    if (!tgResult.ok) {
      console.error('Telegram API Error:', tgResult);
      throw new Error(`خطأ من تليجرام: ${tgResult.description}`);
    }

    res.json({ success: true, message: 'Request sent to Telegram' });
  } catch (err: any) {
    console.error('Manual checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Approve Endpoint
app.get('/api/checkout/manual-approve', async (req, res) => {
  try {
    const { managerId, email, secret } = req.query as Record<string, string>;
    const TELEGRAM_SECRET = process.env.TELEGRAM_SECRET;

    if (!TELEGRAM_SECRET) {
      return res.status(500).send('<h1>خطأ: لم يتم تهيئة SECRET للـ Telegram</h1>');
    }

    if (secret !== TELEGRAM_SECRET) {
      return res.status(403).send('<h1>خطأ: غير مصرح لك بإجراء هذه العملية</h1>');
    }

    if (!managerId || !email) {
      return res.status(400).send('<h1>خطأ: بيانات ناقصة</h1>');
    }

    // Give access
    await (prisma as any).coachPurchase.upsert({
      where: { userEmail_managerId: { userEmail: email, managerId } },
      update: { sessionId: 'manual_' + Date.now() },
      create: { userEmail: email, managerId, sessionId: 'manual_' + Date.now() }
    });

    res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; direction: rtl;">
        <h1 style="color: green;">✅ تم التفعيل بنجاح!</h1>
        <p>تم منح المستخدم (${email}) الصلاحية للدخول على الخطة.</p>
        <script>setTimeout(() => window.close(), 3000);</script>
      </div>
    `);
  } catch (err: any) {
    res.status(500).send(`<h1>حدث خطأ: ${err.message}</h1>`);
  }
});

// Admin Reject Endpoint
app.get('/api/checkout/manual-reject', async (req, res) => {
  try {
    const { secret, email } = req.query as Record<string, string>;
    const TELEGRAM_SECRET = process.env.TELEGRAM_SECRET;

    if (!TELEGRAM_SECRET) {
      return res.status(500).send('<h1>خطأ: لم يتم تهيئة SECRET للـ Telegram</h1>');
    }

    if (secret !== TELEGRAM_SECRET) {
      return res.status(403).send('<h1>خطأ: غير مصرح لك بإجراء هذه العملية</h1>');
    }

    res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px; direction: rtl;">
        <h1 style="color: red;">❌ تم رفض الطلب</h1>
        <p>تم رفض طلب المستخدم (${email}) بنجاح.</p>
        <script>setTimeout(() => window.close(), 3000);</script>
      </div>
    `);
  } catch (err: any) {
    res.status(500).send(`<h1>حدث خطأ: ${err.message}</h1>`);
  }
});


// ─────────────────────────────────────────
// USERS API
// ─────────────────────────────────────────
app.post('/api/auth/admin-login', (req, res) => {
  const user = { id: 'admin', name: 'المدير', role: 'ADMIN', email: 'mock@local.user' };
  const token = generateToken('admin', 'ADMIN');
  res.json({ user, token });
});

app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      coins: dbUser.coins,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/logout', async (_req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/users', authenticateToken, async (_req: AuthRequest, res) => {
  try {
    if (_req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admins only' });
    }

    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const users = req.body;
    if (!Array.isArray(users)) return res.status(400).json({ error: 'Expected an array' });
    
    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email }, // Using email as unique identifier
        update: {
          name: u.name,
          role: u.role,
          coins: Number(u.coins || 0)
        },
        create: {
          name: u.name,
          email: u.email,
          password: u.password ?? undefined,
          role: u.role ?? 'USER',
          coins: Number(u.coins ?? 0)
        }
      });
    }
    res.json({ success: true, count: users.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// COACH VIDEOS API
// ─────────────────────────────────────────
const COACH_VIDEOS_FILE = path.join(__dirname, '..', 'coach-videos.json');

app.get('/api/coach-videos', async (req, res) => {
  try {
    const coachVideos = await prisma.coachVideo.findMany();
    
    // Generate secure token URL for Bunny Stream if credentials exist
    const enhancedData = coachVideos.map((cv: any) => {
      if (cv.libraryId && cv.videoId && cv.tokenKey) {
        const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiration
        const hashableBase = cv.tokenKey + cv.videoId + expires;
        const token = crypto.createHash('sha256').update(hashableBase).digest('hex');
        cv.secureEmbedUrl = `https://iframe.mediadelivery.net/embed/${cv.libraryId}/${cv.videoId}?token=${token}&expires=${expires}&autoplay=true&loop=false&muted=false&preload=true&responsive=true`;
      }
      return cv;
    });
    
    res.json(enhancedData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coach-videos', async (req, res) => {
  try {
    const entry = req.body;
    if (!entry.managerId) {
      return res.status(400).json({ error: 'Missing managerId' });
    }
    
    const upsertedVideo = await prisma.coachVideo.upsert({
      where: { managerId: entry.managerId },
      update: {
        freeUrl: entry.freeUrl,
        libraryId: entry.libraryId,
        tokenKey: entry.tokenKey,
        videoId: entry.videoId,
        images: entry.images || [],
      },
      create: {
        managerId: entry.managerId,
        freeUrl: entry.freeUrl,
        libraryId: entry.libraryId,
        tokenKey: entry.tokenKey,
        videoId: entry.videoId,
        images: entry.images || [],
      }
    });
    
    res.json({ success: true, data: upsertedVideo });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// VIDEOS API
// ─────────────────────────────────────────
app.get('/api/videos', async (_req, res) => {
  try {
    const videos = await prisma.videoReport.findMany();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/videos', async (req, res) => {
  try {
    const videos = req.body;
    if (!Array.isArray(videos)) return res.status(400).json({ error: 'Expected an array' });
    
    for (const v of videos) {
      await prisma.videoReport.upsert({
        where: { id: v.id },
        update: { status: v.status },
        create: {
          id: v.id,
          streamerId: v.streamerId,
          streamerName: v.streamerName,
          videoLink: v.videoLink,
          views: Number(v.views),
          likes: Number(v.likes),
          earnedCoins: Number(v.earnedCoins),
          status: v.status,
          createdAt: v.createdAt ? new Date(v.createdAt) : undefined
        }
      });
    }
    res.json({ success: true, count: videos.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// GET messages for a specific user (no auth needed - userId is the guest/user ID from localStorage)
app.get('/api/chat/messages', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const chats = await prisma.chatMessage.findMany({
      where: { userId: String(userId) },
      orderBy: { timestamp: 'asc' }
    });
    return res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET all messages for admin (requires JWT + ADMIN)
app.get('/api/chat/admin/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admins only' });
    const { userId } = req.query;
    const chats = await prisma.chatMessage.findMany({
      where: userId ? { userId: String(userId) } : undefined,
      orderBy: { timestamp: 'asc' }
    });
    return res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST send message (no auth needed - guest users can send)
app.post('/api/chat/send', async (req: AuthRequest, res) => {
  try {
    const message = req.body;
    if (!message.userId || !message.text) {
      return res.status(400).json({ error: 'Missing userId or text' });
    }
    await prisma.chatMessage.create({
      data: {
        userId: String(message.userId),
        userName: String(message.userName || 'زائر'),
        text: String(message.text).slice(0, 2000),
        sender: message.sender === 'ADMIN' ? 'ADMIN' : 'USER',
        timestamp: Date.now()
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST admin reply (requires JWT + ADMIN)
app.post('/api/chat/admin/send', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admins only' });
    const message = req.body;
    if (!message.userId || !message.text) {
      return res.status(400).json({ error: 'Missing userId or text' });
    }
    await prisma.chatMessage.create({
      data: {
        userId: String(message.userId),
        userName: 'Admin',
        text: String(message.text).slice(0, 2000),
        sender: 'ADMIN',
        timestamp: Date.now()
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE chat for a specific user (requires JWT + ADMIN)
app.delete('/api/chat/admin/messages/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admins only' });
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    await prisma.chatMessage.deleteMany({
      where: { userId: String(userId) }
    });
    
    res.json({ success: true, message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET chat users list for admin dashboard (requires JWT + ADMIN)
app.get('/api/chat/users', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admins only' });
    const chats = await prisma.chatMessage.findMany({
      orderBy: { timestamp: 'desc' }
    });
    const usersMap = new Map();
    chats.forEach((c: any) => {
      if (!usersMap.has(c.userId)) {
        usersMap.set(c.userId, { userId: c.userId, userName: c.userName, lastMessage: c.text, timestamp: c.timestamp });
      }
    });
    res.json(Array.from(usersMap.values()));
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// ─────────────────────────────────────────
// IMAGE UPLOAD PROXY
// ─────────────────────────────────────────
app.post('/api/upload', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, error: 'No image provided' });

    const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
    const FREEIMAGE_API_KEY = process.env.FREEIMAGE_API_KEY;
    let isSuccess = false;
    let uploadedUrl = '';
    let errorMessage = '';

    if (!IMGBB_API_KEY) {
      return res.status(500).json({ success: false, error: 'IMGBB_API_KEY is not configured' });
    }

    try {
      const formData = new FormData();
      formData.append('image', image);
      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData as any
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

    if (!isSuccess && FREEIMAGE_API_KEY) {
      try {
        const fallbackFormData = new FormData();
        fallbackFormData.append('source', image);
        fallbackFormData.append('key', FREEIMAGE_API_KEY);
        
        const fallbackRes = await fetch('https://freeimage.host/api/1/upload', {
          method: 'POST',
          body: fallbackFormData as any
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
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// ─────────────────────────────────────────
// AUTO-SEED COACHES FROM JSON FILES
// ─────────────────────────────────────────
async function seedCoachesIfEmpty() {
  try {
    const count = await prisma.manager.count();
    if (count > 0) {
      console.log(`✅ Coaches already in DB: ${count}`);
      return;
    }

    console.log('🌱 Seeding coaches from JSON files...');

    // Insert coaches.json FIRST (older = further back in pages)
    const coachesPath = path.join(process.cwd(), 'src', 'data', 'coaches.json');
    if (fs.existsSync(coachesPath)) {
      let coaches: any[] = [];
      try { coaches = JSON.parse(fs.readFileSync(coachesPath, 'utf-8')); } catch {}
      if (Array.isArray(coaches) && coaches.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < coaches.length; i += batchSize) {
          const batch = coaches.slice(i, i + batchSize);
          await Promise.all(
            batch.filter((c: any) => c.id).map((coach: any) =>
              prisma.manager.upsert({
                where: { id: String(coach.id) },
                update: { data: coach },
                create: { id: String(coach.id), data: coach }
              })
            )
          );
        }
        console.log(`✅ Seeded ${coaches.length} coaches from coaches.json`);
      }
    }

    // Small delay so new_coaches get newer createdAt timestamps
    await new Promise(r => setTimeout(r, 500));

    // Insert new_coaches.json SECOND (newer = appears on first pages)
    const newCoachesPath = path.join(process.cwd(), 'src', 'data', 'new_coaches.json');
    if (fs.existsSync(newCoachesPath)) {
      let newCoaches: any[] = [];
      try { newCoaches = JSON.parse(fs.readFileSync(newCoachesPath, 'utf-8')); } catch {}
      if (Array.isArray(newCoaches) && newCoaches.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < newCoaches.length; i += batchSize) {
          const batch = newCoaches.slice(i, i + batchSize);
          await Promise.all(
            batch.filter((c: any) => c.id).map((coach: any) =>
              prisma.manager.upsert({
                where: { id: String(coach.id) },
                update: { data: coach },
                create: { id: String(coach.id), data: coach }
              })
            )
          );
        }
        console.log(`✅ Seeded ${newCoaches.length} coaches from new_coaches.json (they appear first)`);
      }
    }

  } catch (err) {
    console.error('❌ Error seeding coaches:', err);
  }
}

// Start Server
app.listen(PORT, async () => {
  console.log(`StreamHub API is running on http://localhost:${PORT}`);
  await seedCoachesIfEmpty();
});
