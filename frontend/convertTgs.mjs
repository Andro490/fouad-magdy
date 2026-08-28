import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const inputPath = path.join(__dirname, 'src', 'assets', 'AnimatedSticker.tgs');
  const outputPath = path.join(__dirname, 'src', 'assets', 'verified.json');
  
  const input = fs.readFileSync(inputPath);
  const unzipped = zlib.gunzipSync(input);
  fs.writeFileSync(outputPath, unzipped);
  console.log('✅ Successfully converted AnimatedSticker.tgs to verified.json');
} catch (error) {
  console.error('❌ Error converting file:', error.message);
}
