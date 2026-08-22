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
    const coaches = await prisma.manager.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
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
    const files = ['coaches.json', 'new_coaches.json'];
    const map = new Map<string, any>();

    for (const file of files) {
      const filePath = path.join(process.cwd(), 'src', 'data', file);
      if (!fs.existsSync(filePath)) continue;
      
      const raw = fs.readFileSync(filePath, 'utf-8');
      let data: any[] = [];
      try { data = JSON.parse(raw); } catch { continue; }
      if (!Array.isArray(data)) continue;

      data.forEach((coach: any) => {
        if (coach.id) map.set(String(coach.id), coach);
      });
    }

    const coaches = Array.from(map.values());
    if (coaches.length === 0) return;

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < coaches.length; i += batchSize) {
      const batch = coaches.slice(i, i + batchSize);
      await Promise.all(
        batch.map((coach: any) =>
          prisma.manager.upsert({
            where: { id: String(coach.id) },
            update: { data: coach },
            create: { id: String(coach.id), data: coach }
          })
        )
      );
    }

    console.log(`✅ Seeded ${coaches.length} coaches into PostgreSQL!`);
  } catch (err) {
    console.error('❌ Error seeding coaches:', err);
  }
}

// Start Server
app.listen(PORT, async () => {
  console.log(`StreamHub API is running on http://localhost:${PORT}`);
  await seedCoachesIfEmpty();
});
