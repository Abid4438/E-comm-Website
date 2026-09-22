import https from 'https';
import fs from 'fs';

function download(url, file) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(file);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redir = response.headers.location;
        let target = redir;
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

const badIds = [
  'photo-1629853925760-b0ff0739c9cb',
  'photo-1594913255169-dc94daac430b',
  'photo-1542459992-bf393beba392',
  'photo-1594877717621-e37d57c2a1a8',
  'photo-1627341398862-23b6329fc808',
  'photo-1608248597359-0010c2c1a84f',
  'photo-1603006905206-a83a0fbdac22',
  'photo-1600857544200-b2f70b4a45a3',
  'photo-1616401784845-180882ba7654',
  'photo-1555546252-875c7b337c72'
];

async function go() {
  for (const id of badIds) {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
    const out = `public/images/products/${id}.jpg`;
    console.log('Retry', id);
    try {
      await download(url, out);
      const s = fs.statSync(out).size;
      console.log('  OK size=', s, s < 100 ? 'BAD' : 'GOOD');
    } catch (e) {
      console.log('  ERROR', e.message);
    }
  }
}
go();
