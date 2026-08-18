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
app.use(cors());
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


// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to eFootball Store API 🚀' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
