import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(helmet());
app.use(morgan('dev'));

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to StreamHub API with PostgreSQL 🚀' });
});

// ─────────────────────────────────────────
// MANAGERS API
// ─────────────────────────────────────────
app.get('/api/managers', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 15;
    
    const totalCoaches = await prisma.manager.count();
    
    // Cast string ID to numeric to ensure 14-digit IDs are sorted properly above 8-digit IDs
    const coaches: any[] = await prisma.$queryRaw`
      SELECT * FROM "Manager"
      ORDER BY CAST(id AS BIGINT) DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;
    
    res.json({
      page,
      totalPages: Math.ceil(totalCoaches / limit),
      totalCoaches,
      coaches: coaches.map((c: any) => c.data)
    });
  } catch (err) {
    console.error('Error fetching managers:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/managers/reset', async (req, res) => {
  try {
    await prisma.manager.deleteMany({});
    await seedCoachesIfEmpty();
    res.json({ message: 'Managers reset and re-seeded successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/managers/add', async (req, res) => {
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

    let addedCount = 0;
    for (const coach of newCoaches) {
      if (coach.id) {
        await prisma.manager.upsert({
          where: { id: coach.id.toString() },
          update: { data: coach },
          create: { id: coach.id.toString(), data: coach }
        });
        addedCount++;
      }
    }

    res.json({ success: true, message: `تمت إضافة ${addedCount} مدرب بنجاح!` });
  } catch (err: any) {
    console.error('Error adding coaches:', err);
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
    params.append('success_url', (successUrl || 'http://localhost:5173/payment-success') + '?session_id={CHECKOUT_SESSION_ID}');
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

// Verify a completed Stripe session
app.get('/api/checkout/verify', async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ paid: false, error: 'Missing session_id' });

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) return res.status(500).json({ paid: false, error: 'Stripe not configured' });

    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
    });
    const session = await response.json();

    if (session.error) return res.status(400).json({ paid: false, error: session.error.message });

    res.json({ paid: session.payment_status === 'paid' });
  } catch (err: any) {
    res.status(500).json({ paid: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// USERS API
// ─────────────────────────────────────────
app.get('/api/users', async (_req, res) => {
  try {
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
    if (!fs.existsSync(COACH_VIDEOS_FILE)) {
      return res.json([]);
    }
    const data = fs.readFileSync(COACH_VIDEOS_FILE, 'utf-8');
    res.json(JSON.parse(data || '[]'));
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
    
    let currentData: any[] = [];
    if (fs.existsSync(COACH_VIDEOS_FILE)) {
      const fileData = fs.readFileSync(COACH_VIDEOS_FILE, 'utf-8');
      currentData = JSON.parse(fileData || '[]');
    }
    
    // Remove existing entry for this manager if it exists
    currentData = currentData.filter(d => d.managerId !== entry.managerId);
    
    // Add new entry
    currentData.unshift(entry);
    
    fs.writeFileSync(COACH_VIDEOS_FILE, JSON.stringify(currentData, null, 2));
    res.json({ success: true, count: currentData.length });
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
// CHAT SYSTEM
// ─────────────────────────────────────────
app.get('/api/chat/messages', async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      const chats = await prisma.chatMessage.findMany({ where: { userId: String(userId) } });
      return res.json(chats);
    }
    const chats = await prisma.chatMessage.findMany();
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/chat/send', async (req, res) => {
  try {
    const message = req.body;
    await prisma.chatMessage.create({
      data: {
        userId: message.userId,
        userName: message.userName,
        text: message.text,
        sender: message.sender,
        timestamp: Date.now()
      }
    });
    res.json({ success: true, message: 'تم إرسال الرسالة بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/chat/users', async (req, res) => {
  try {
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

    const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '64893796dcb70764722c0d575faeb0a9';
    let isSuccess = false;
    let uploadedUrl = '';
    let errorMessage = '';

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

    if (!isSuccess) {
      try {
        const fallbackFormData = new FormData();
        fallbackFormData.append('source', image);
        fallbackFormData.append('key', '6d207e02198a847aa98d0a2a901485a5');
        
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
