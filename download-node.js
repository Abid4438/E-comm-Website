import https from 'https';
import fs from 'fs';

function download(url, file) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(file);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redir = response.headers.location;
        if (redir && redir.startsWith('http')) {
          download(redir, file).then(resolve).catch(reject);
        } else if (redir) {
          download('https://images.unsplash.com' + redir, file).then(resolve).catch(reject);
        } else {
          reject(new Error('No redirect'));
        }
        return;
      }
      response.pipe(fileStream);
      fileStream.on('finish', () => { fileStream.close(); resolve(); });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

// Read local paths from data, derive original unsplash IDs
const d = fs.readFileSync('src/data/productsData.ts', 'utf8');
const localPaths = [...new Set(d.match(/\/images\/products\/[^'"\s]+\.jpg/g) || [])];

async function go() {
  for (let i = 0; i < localPaths.length; i++) {
    const p = localPaths[i];
    const id = p.replace('/images/products/', '').replace('.jpg', '');
    const url = `https://images.unsplash.com/photo-${id.split('-').pop()}?auto=format&fit=crop&w=1200&q=80`;
    const out = 'public/images/products/' + id + '.jpg';
    console.log('Downloading', i+1, id);
    try {
      await download(url, out);
      console.log('  OK', out, fs.statSync(out).size);
    } catch (e) {
      console.log('  ERROR', e.message);
    }
  }
}
go();
