import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import https from 'https';
// import authRoutes from './routes/authRoutes'; // معطل مؤقتاً لتفادي أخطاء قاعدة البيانات

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // السماح بطلبات بدون origin (مثل Postman) وطلبات من المصادر المسموح بها
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://fouad-magdy.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // مؤقتاً نسمح للكل لحين الاستقرار
    }
  },
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

// Routes
// app.use('/api/auth', authRoutes); // معطل مؤقتاً

// Proxy Route for Managers - يجرب coaches API أول، وعند الفشل يرجع للملف الثابت
app.get('/api/managers', (req, res) => {
  const fetchFromUrl = (hostname: string, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname,
        path,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'identity',
          'Referer': 'https://efhub.com/',
          'Origin': 'https://efhub.com',
          'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Connection': 'keep-alive',
        }
      };
      https.get(options, (apiRes) => {
        let body = '';
        apiRes.on('data', (chunk: string) => body += chunk);
        apiRes.on('end', () => resolve(body));
      }).on('error', reject);
    });
  };

  // حاول تجيب من الـ coaches API أول (فيه skills وlinkup)
  fetchFromUrl('efhub.com', '/api/public/coaches')
    .then(body => {
      const data = JSON.parse(body);
      // لو Cloudflare رد بـ HTML مش JSON، استخدم الملف الثابت
      if (!Array.isArray(data) && !data?.coaches && !data?.data) throw new Error('Not valid JSON array');
      console.log('✅ Got data from coaches API');
      res.json(data);
    })
    .catch(() => {
      console.log('⚠️  coaches API failed, trying static managers.json...');
      // fallback للملف الثابت
      fetchFromUrl('efhub.com', '/data/managers.json?v=dpl_GGgEACniQ1Rd9SUyfqHdSTxPv54a')
        .then(body => {
          const data = JSON.parse(body);
          console.log('✅ Got data from static managers.json');
          res.json(data);
        })
        .catch(err => {
          console.error('❌ Both sources failed:', err);
          res.status(500).json({ error: true, message: 'Failed to fetch manager data' });
        });
    });
});


// Order Route - Sends data to Telegram
app.post('/api/order', async (req, res) => {
  try {
    const { name, phone, gameId, productName, price, receiptBase64 } = req.body;
    
    if (!name || !phone || !receiptBase64) {
      return res.status(400).json({ error: true, message: 'بيانات غير مكتملة' });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('⚠️ Telegram credentials not configured. Saving order locally.');
      // If no telegram setup, just return success for now (mocked)
      return res.json({ success: true, message: 'Order received (Mock)' });
    }

    const caption = `
🛒 **طلب جديد من المتجر** 🛒
------------------------
👤 **الاسم:** ${name}
📱 **رقم الهاتف:** ${phone}
🎮 **الأيدي (ID):** ${gameId}
📦 **المنتج:** ${productName}
💵 **السعر:** ${price} EGP
------------------------
`;

    const base64Data = receiptBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('caption', caption);
    formData.append('parse_mode', 'Markdown');
    formData.append('photo', blob, 'receipt.jpg');

    const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData
    });

    if (!tgResponse.ok) {
      const errData = await tgResponse.text();
      console.error('Telegram API Error:', errData);
      throw new Error('فشل إرسال الإشعار لتيليجرام');
    }

    res.json({ success: true, message: 'تم إرسال الطلب بنجاح' });
  } catch (error) {
    console.error('Order Error:', error);
    res.status(500).json({ error: true, message: 'حدث خطأ داخلي في السيرفر' });
  }
});

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to eFootball Store API 🚀' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
