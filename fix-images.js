import fs from 'fs';
const d = fs.readFileSync('src/data/productsData.ts', 'utf8');
const urls = [...new Set(d.match(/https:\/\/images\.unsplash\.com\/[^'"\s]+/g) || [])];
console.log('Replacing', urls.length, 'unique URLs with local paths');
let out = d;
urls.forEach((url, i) => {
  const id = url.split('/').pop()?.split('?')[0] || ('img'+i);
  const local = `/images/products/${id}.jpg`;
  // Replace all occurrences of this exact URL
  out = out.split(url).join(local);
  console.log(url, '->', local);
});
fs.writeFileSync('src/data/productsData.ts', out);
console.log('Done. Now download each...');
