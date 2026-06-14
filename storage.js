require('dotenv').config();
const fs = require('fs');
const FICHIER = 'posts-connus.json';

function chargerIdsConnus() {
  try {
    if (!fs.existsSync(FICHIER)) return new Set();
    return new Set(JSON.parse(fs.readFileSync(FICHIER, 'utf8')));
  } catch (_) { return new Set(); }
}

function sauvegarderIds(ids) {
  try { fs.writeFileSync(FICHIER, JSON.stringify([...ids], null, 2)); } catch (_) {}
}

function filtrerNouveaux(posts) {
  const connus   = chargerIdsConnus();
  const nouveaux = posts.filter(p => !connus.has(p.id));
  nouveaux.forEach(p => connus.add(p.id));
  sauvegarderIds(connus);
  return nouveaux;
}

module.exports = { filtrerNouveaux };
