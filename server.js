require('dotenv').config();
const express   = require('express');
const rateLimit = require('express-rate-limit');
const fs        = require('fs');
const { genererRSS, nombreDePosts } = require('./rss-generator');
const { getStatut }                 = require('./scheduler');

const app  = express();
const PORT = process.env.PORT || 3000;
app.set('trust proxy', 1);

const limiter = rateLimit({ windowMs: 60000, max: 20 });

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: Math.floor(process.uptime()) + 's' }));

app.get('/rss', limiter, (req, res) => {
  try {
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(genererRSS());
  } catch (e) { res.status(500).send('Erreur : ' + e.message); }
});

app.get('/feed.xml', limiter, (req, res) => {
  fs.existsSync('feed.xml') ? res.download('feed.xml') : res.status(404).send('Pas encore généré.');
});

app.get('/status', (req, res) => {
  const { derniereVerification, totalNouveaux, enCours } = getStatut();
  res.json({
    status: 'ok',
    posts_en_memoire: nombreDePosts(),
    total_collectes: totalNouveaux,
    scraping_en_cours: enCours,
    derniere_verification: derniereVerification?.toLocaleString('fr-FR') || 'En attente...'
  });
});

app.get('/', (req, res) => {
  const { derniereVerification, totalNouveaux, enCours } = getStatut();
  const host = process.env.RENDER_EXTERNAL_HOSTNAME
    ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
    : `http://localhost:${PORT}`;
  res.send(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fabrizio RSS Bot</title><meta http-equiv="refresh" content="30"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;background:#f0f2f5;padding:24px 16px}.wrap{max-width:520px;margin:0 auto}h1{color:#1877F2;font-size:20px;margin-bottom:16px}.card{background:#fff;border-radius:12px;padding:18px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.1)}h3{font-size:13px;color:#666;margin-bottom:10px;text-transform:uppercase}p{font-size:14px;color:#333;margin-bottom:6px;line-height:1.6}a{color:#1877F2;font-weight:600;text-decoration:none}.url{background:#f5f5f5;border-radius:6px;padding:8px 12px;font-family:monospace;font-size:12px;word-break:break-all;margin:6px 0 10px}.badge{display:inline-block;padding:2px 8px;border-radius:5px;font-size:12px;font-weight:600;color:#fff;background:#1877F2}</style></head><body><div class="wrap"><h1>⚽ Fabrizio Romano RSS Bot</h1><div class="card"><h3>📡 Flux RSS</h3><div class="url">${host}/rss</div><p><a href="/rss">Voir le RSS</a> · <a href="/status">Statut</a></p></div><div class="card"><h3>📊 État</h3><p>Posts collectés : <span class="badge">${totalNouveaux}</span></p><p>En mémoire : <span class="badge">${nombreDePosts()}</span></p><p>Dernière vérif : ${derniereVerification?.toLocaleString('fr-FR') || 'En attente...'}</p></div><div class="card"><h3>❤️ UptimeRobot</h3><div class="url">${host}/health</div></div></div></body></html>`);
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Bot démarré — port ${PORT}`);
  console.log(`📡 RSS    → /rss`);
  console.log(`❤️  Health → /health`);
  console.log('='.repeat(50));
});
