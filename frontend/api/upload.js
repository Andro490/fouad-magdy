// Vercel Serverless Function - /api/upload
// This runs on the server-side, so no CORS issues!

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  // Allow CORS from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ success: false, error: 'No image provided' });
  }

  const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '878a3e7d1975c224f0cfc02c0bd29299';

  // Try ImgBB first
  try {
    const formData = new FormData();
    formData.append('image', image);
    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });
    const imgbbData = await imgbbRes.json();
    if (imgbbData.success) {
      return res.status(200).json({ success: true, url: imgbbData.data.url });
    }
    console.log('ImgBB failed:', imgbbData.error?.message);
  } catch (e) {
    console.log('ImgBB error:', e.message);
  }

  // Fallback: freeimage.host
  try {
    const fallbackForm = new FormData();
    fallbackForm.append('source', image);
    fallbackForm.append('key', '6d207e02198a847aa98d0a2a901485a5');
    const fallbackRes = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: fallbackForm,
    });
    const fallbackData = await fallbackRes.json();
    if (fallbackData.status_code === 200) {
      return res.status(200).json({ success: true, url: fallbackData.image.url });
    }
    console.log('Freeimage failed:', fallbackData);
  } catch (e) {
    console.log('Freeimage error:', e.message);
  }

  return res.status(500).json({ success: false, error: 'All upload services failed.' });
}
