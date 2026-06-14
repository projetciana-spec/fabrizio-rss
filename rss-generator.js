require('dotenv').config();
const RSS = require('rss');
const fs  = require('fs');

let tousLesPosts = [];

function ajouterPosts(nouveaux) {
  // Dédupliquer par ID avant d'ajouter
  const idsExistants = new Set(tousLesPosts.map(p => p.id));
  const vraiNouveaux = nouveaux.filter(p => !idsExistants.has(p.id));
  tousLesPosts = [...vraiNouveaux, ...tousLesPosts];
  if (tousLesPosts.length > 100) tousLesPosts = tousLesPosts.slice(0, 100);
  console.log(`📝 RSS : ${tousLesPosts.length} post(s) en mémoire`);
}

function genererRSS() {
  const host = process.env.RENDER_EXTERNAL_HOSTNAME
    ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
    : `http://localhost:${process.env.PORT || 3000}`;

  const feed = new RSS({
    title:       '⚽ Fabrizio Romano — Here We Go',
    description: 'Dernières actualités transferts football',
    feed_url:    `${host}/rss`,
    site_url:    process.env.FB_PAGE_URL,
    language:    'fr',
    pubDate:     new Date(),
    ttl:         5,
    // ✅ Activer les namespaces media pour les images
    custom_namespaces: {
      'media': 'http://search.yahoo.com/mrss/'
    }
  });

  tousLesPosts.forEach(post => {
    const titre = post.texte
      ? post.texte.substring(0, 80).replace(/\n/g, ' ') + (post.texte.length > 80 ? '...' : '')
      : '📸 Nouveau post';

    let desc = '';
    if (post.texte)  desc += `<p>${post.texte.replace(/\n/g, '<br>')}</p>`;
    if (post.images && post.images.length > 0) {
      post.images.forEach(s => { desc += `<p><img src="${s}" style="max-width:100%"/></p>`; });
    }
    if (post.lien) desc += `<p><a href="${post.lien}">🔗 Voir le post original</a></p>`;

    // ✅ FIX : Ajouter l'image principale en <enclosure> ET <media:content>
    const imageUrl = post.images && post.images[0] ? post.images[0] : null;

    const itemOptions = {
      title:       titre,
      description: desc,
      url:         post.lien || process.env.FB_PAGE_URL,
      guid:        post.id,  // ✅ ID stable maintenant
      date:        new Date(post.date)
    };

    // ✅ Enclosure standard (lu par n8n et tous les lecteurs RSS)
    if (imageUrl) {
      itemOptions.enclosure = {
        url:    imageUrl,
        type:   'image/jpeg',
        length: 0
      };
      // ✅ Media content (lu par certains readers)
      itemOptions.custom_elements = [
        { 'media:content': { _attr: { url: imageUrl, type: 'image/jpeg', medium: 'image' } } },
        { 'media:thumbnail': { _attr: { url: imageUrl } } }
      ];
    }

    feed.item(itemOptions);
  });

  const xml = feed.xml({ indent: true });
  try { fs.writeFileSync('feed.xml', xml, 'utf8'); } catch (_) {}
  return xml;
}

function nombreDePosts() { return tousLesPosts.length; }
module.exports = { ajouterPosts, genererRSS, nombreDePosts };
