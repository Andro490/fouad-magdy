const fs = require('fs');
const path = require('path');

async function scrape() {
  console.log("Starting to scrape 76 pages from EFHub...");
  const allCoaches = [];
  
  for (let i = 1; i <= 76; i++) {
    console.log(`Fetching page ${i}...`);
    try {
      const res = await fetch(`https://efhub.com/api/public/coaches?page=${i}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      if (!res.ok) {
        console.error(`Page ${i} failed with status ${res.status}`);
        continue;
      }
      const data = await res.json();
      
      let pageArray = [];
      if (data && data.coaches && Array.isArray(data.coaches)) {
        pageArray = data.coaches;
      } else if (Array.isArray(data)) {
        pageArray = data;
      } else {
        const arr = Object.values(data).find(v => Array.isArray(v));
        if (arr) pageArray = arr;
      }
      
      allCoaches.push(...pageArray);
      console.log(`Got ${pageArray.length} coaches from page ${i}. Total: ${allCoaches.length}`);
      
      // Delay 300ms to avoid temporary rate limits
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`Error on page ${i}:`, err.message);
    }
  }
  
  const outDir = path.join(__dirname, 'src', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  const outFile = path.join(outDir, 'coaches.json');
  fs.writeFileSync(outFile, JSON.stringify(allCoaches, null, 2));
  console.log(`✅ Success! Saved ${allCoaches.length} total coaches to ${outFile}`);
}

scrape();
