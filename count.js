import fs from 'fs';
const d = fs.readFileSync('src/data/productsData.ts', 'utf8');
const m = d.match(/https:\/\/images\.unsplash\.com\/[^'"\s]+/g);
console.log('Image URLs:', m ? m.length : 0);
if (m) console.log('Unique:', [...new Set(m)].length);
