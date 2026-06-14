require('dotenv').config();
var axios = require('axios');

async function scraperFabrizio() {
  try {
    var token   = process.env.APIFY_TOKEN;
    var pageUrl = process.env.FB_PAGE_URL;

    console.log('Lancement Apify Facebook Scraper...');

    var runReponse = await axios.post(
      'https://api.apify.com/v2/acts/apify~facebook-posts-scraper/runs',
      { startUrls: [{ url: pageUrl }], maxPosts: 20 },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        timeout: 120000
      }
    );

    var runId = runReponse.data.data.id;
    console.log('Run lance, ID : ' + runId);

    var statut = '';
    var tentatives = 0;
    while (statut !== 'SUCCEEDED' && statut !== 'FAILED' && tentatives < 24) {
      await new Promise(function(r) { setTimeout(r, 5000); });
      tentatives++;
      var checkReponse = await axios.get(
        'https://api.apify.com/v2/actor-runs/' + runId,
        { headers: { 'Authorization': 'Bearer ' + token } }
      );
      statut = checkReponse.data.data.status;
      console.log('Statut run : ' + statut + ' (' + tentatives + '/24)');
    }

    if (statut !== 'SUCCEEDED') {
      console.log('Run echoue ou timeout');
      return [];
    }

    var datasetId = runReponse.data.data.defaultDatasetId;
    var dataReponse = await axios.get(
      'https://api.apify.com/v2/datasets/' + datasetId + '/items',
      {
        headers: { 'Authorization': 'Bearer ' + token },
        params: { limit: 20 }
      }
    );

    var items = dataReponse.data || [];
    console.log(items.length + ' posts recuperes via Apify');

    var posts = items.map(function(item) {
      // ✅ FIX : ID stable basé sur postId uniquement — plus de Date.now()
      var stableId = 'fabrizio-' + (item.postId || item.url || '').replace(/[^a-zA-Z0-9]/g, '-');

      return {
        id:     stableId,
        texte:  item.text || item.message || '',
        images: item.media
          ? item.media
              .filter(function(m) { return m.type === 'photo'; })
              .map(function(m) { return m.url || ''; })
              .filter(function(u) { return u.length > 0; })
          : [],
        video: null,
        lien:  item.url || pageUrl,
        date:  item.time ? new Date(item.time).toISOString() : new Date().toISOString()
      };
    }).filter(function(p) { return p.texte.length > 0 || p.images.length > 0; });

    console.log(posts.length + ' post(s) extraits');
    return posts;

  } catch (err) {
    console.error('Erreur Apify: ' + err.message);
    if (err.response) console.error('Detail: ' + JSON.stringify(err.response.data));
    return [];
  }
}

module.exports = { scraperFabrizio };
