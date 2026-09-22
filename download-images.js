import { spawn } from 'child_process';
import fs from 'fs';

const d = fs.readFileSync('src/data/productsData.ts', 'utf8');
const urls = [...new Set(d.match(/https:\/\/images\.unsplash\.com\/[^'"\s]+/g) || [])];

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  const id = url.split('/').pop()?.split('?')[0] || ('img'+i);
  const out = `public/images/products/${id}.jpg`;
  console.log(`Downloading ${i+1}/${urls.length} -> ${out}`);
  const proc = spawn('curl', ['-L', '-o', out, url], { stdio: 'inherit' });
  await new Promise((r, j) => proc.on('close', c => c === 0 ? r() : j(new Error('curl failed'))));
}
console.log('All downloaded');
