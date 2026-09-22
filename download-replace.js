import https from 'https';
import fs from 'fs';

function download(url, file) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(file);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redir = response.headers.location;
        let target = redir || '';
        if (target && target.startsWith('/')) target = 'https://images.unsplash.com' + target;
        else if (target && !target.startsWith('http')) target = 'https://images.unsplash.com/' + target;
        download(target, file).then(resolve).catch(reject);
        return;
      }
      response.pipe(fileStream);
      fileStream.on('finish', () => { fileStream.close(); resolve(); });
      response.on('error', reject);
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

const map = {
  'photo-1629853925760-b0ff0739c9cb.jpg': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
  'photo-1594913255169-dc94daac430b.jpg': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  'photo-1542459992-bf393beba392.jpg': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
  'photo-1594877717621-e37d57c2a1a8.jpg': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
  'photo-1627341398862-23b6329fc808.jpg': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
  'photo-1608248597359-0010c2c1a84f.jpg': 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
  'photo-1603006905206-a83a0fbdac22.jpg': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
  'photo-1600857544200-b2f70b4a45a3.jpg': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
  'photo-1616401784845-180882ba7654.jpg': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
  'photo-1555546252-875c7b337c72.jpg': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80'
};

async function go() {
  for (const [file, url] of Object.entries(map)) {
    const out = 'public/images/products/' + file;
    console.log('Replacing', file);
    try {
      await download(url, out);
      const s = fs.statSync(out).size;
      console.log('  OK', s, s < 100 ? 'STILL BAD' : 'GOOD');
    } catch (e) {
      console.log('  ERROR', e.message);
    }
  }
}
go();
