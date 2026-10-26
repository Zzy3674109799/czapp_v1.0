import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'www');

const appFiles = [
  'app-icon.svg',
  'app.webmanifest',
  'sw.js',
  'xlsx.full.min.js',
  'tweaks-panel.jsx',
  'pet.jsx',
  'icons.jsx',
  'data.jsx',
  'ui.jsx',
  'home.jsx',
  'record.jsx',
  'bills.jsx',
  'petpage.jsx',
  'goals.jsx',
  'celebrate.jsx',
  'checkin.jsx',
  'import.jsx',
  'insights.jsx',
  'onboarding.jsx',
  'editsheet.jsx',
  'categories.jsx',
  'monthly.jsx',
  'app.jsx'
];

async function copyFile(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
}

await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(path.join(out, 'vendor'), { recursive: true });

let html = await fs.readFile(path.join(root, '存崽记账.html'), 'utf8');
html = html
  .replace(/<script src="https:\/\/unpkg\.com\/react@18\.3\.1\/umd\/react\.development\.js"[^>]*><\/script>/, '<script src="vendor/react.development.js?v=20260608"></script>')
  .replace(/<script src="https:\/\/unpkg\.com\/react-dom@18\.3\.1\/umd\/react-dom\.development\.js"[^>]*><\/script>/, '<script src="vendor/react-dom.development.js?v=20260608"></script>')
  .replace(/<script src="https:\/\/unpkg\.com\/@babel\/standalone@7\.29\.0\/babel\.min\.js"[^>]*><\/script>/, '<script src="vendor/babel.min.js?v=20260608"></script>');

await fs.writeFile(path.join(out, 'index.html'), html);

for (const file of appFiles) {
  await copyFile(path.join(root, file), path.join(out, file));
}

await copyFile(path.join(root, 'node_modules/react/umd/react.development.js'), path.join(out, 'vendor/react.development.js'));
await copyFile(path.join(root, 'node_modules/react-dom/umd/react-dom.development.js'), path.join(out, 'vendor/react-dom.development.js'));
await copyFile(path.join(root, 'node_modules/@babel/standalone/babel.min.js'), path.join(out, 'vendor/babel.min.js'));

console.log(`Prepared Capacitor web assets in ${out}`);
