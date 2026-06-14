const cron = require('node-cron');
const { scraperFabrizio }          = require('./scraper');
const { filtrerNouveaux }          = require('./storage');
const { ajouterPosts, genererRSS } = require('./rss-generator');

let derniereVerification = null;
let totalNouveaux        = 0;
let enCours              = false;

async function verifier() {
  if (enCours) return;
  enCours = true;
  derniereVerification = new Date();
  console.log(`\n⏰ [${derniereVerification.toLocaleTimeString('fr-FR')}] Vérification...`);

  try {
    const posts    = await scraperFabrizio();
    const nouveaux = filtrerNouveaux(posts);
    if (nouveaux.length > 0) {
      console.log(`🆕 ${nouveaux.length} nouveau(x) post(s) !`);
      ajouterPosts(nouveaux);
      genererRSS();
      totalNouveaux += nouveaux.length;
    } else {
      console.log('🔄 Aucun nouveau post.');
    }
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
  enCours = false;
}

verifier();
cron.schedule('*/5 * * * *', verifier);
console.log('⏱️  Surveillance : toutes les 5 minutes\n');
module.exports = { getStatut: () => ({ derniereVerification, totalNouveaux, enCours }) };
