# ⚽ Fabrizio Romano RSS Bot — Guide complet

## 📦 Fichiers du projet
```
fabrizio-rss/
├── server.js          ← point d'entrée
├── scheduler.js       ← vérification toutes les 5 min
├── scraper.js         ← connexion Facebook + extraction
├── rss-generator.js   ← création du flux RSS XML
├── storage.js         ← anti-doublons
├── .env               ← ⚠️ tes identifiants (à modifier)
├── .gitignore         ← protège .env et node_modules
├── package.json       ← dépendances Node.js
└── README.md          ← ce guide
```

---

## ✅ ÉTAPE 1 — Modifier le fichier .env

Ouvrir `.env` avec Notepad (Windows) ou TextEdit (Mac) et remplacer :
```
FB_EMAIL=ton_vrai_email@gmail.com
FB_PASSWORD=ton_vrai_mot_de_passe
```
⚠️ Ne jamais partager ce fichier !

---

## ✅ ÉTAPE 2 — Créer un compte GitHub (sans carte bancaire)

1. Aller sur https://github.com
2. Cliquer "Sign up"
3. Remplir email + mot de passe + nom d'utilisateur
4. Confirmer l'email

---

## ✅ ÉTAPE 3 — Installer Git sur ton PC

- Windows : https://git-scm.com/download/win → installer (tout par défaut)
- Mac : ouvrir Terminal, taper "git" → il s'installe automatiquement

---

## ✅ ÉTAPE 4 — Créer un dépôt GitHub

1. Se connecter sur github.com
2. Cliquer "+" en haut à droite → "New repository"
3. Nom : fabrizio-rss
4. Cocher "Private" ← IMPORTANT
5. Laisser tout le reste par défaut
6. Cliquer "Create repository"

---

## ✅ ÉTAPE 5 — Envoyer le code sur GitHub

⚠️ IMPORTANT : NE PAS faire "npm install" avant ces commandes.
Le dossier node_modules ne doit PAS exister avant d'envoyer sur GitHub.

Ouvrir le terminal dans le dossier fabrizio-rss et taper ces commandes
UNE PAR UNE en appuyant sur Entrée après chaque :

```
git init
git add .
git commit -m "premier envoi"
git branch -M main
git remote add origin https://github.com/TON_NOM_GITHUB/fabrizio-rss.git
git push -u origin main
```

Remplacer TON_NOM_GITHUB par ton vrai nom d'utilisateur GitHub.

GitHub va demander ton email + mot de passe GitHub → les entrer.

---

## ✅ ÉTAPE 6 — Déployer sur Render.com (gratuit, sans carte)

1. Aller sur https://render.com
2. Cliquer "Get Started for Free"
3. S'inscrire avec GitHub (bouton "Continue with GitHub")
4. Autoriser Render à accéder à GitHub
5. Cliquer "New +" → "Web Service"
6. Choisir ton dépôt "fabrizio-rss" → cliquer "Connect"
7. Remplir :
   - Name        : fabrizio-rss
   - Runtime     : Node
   - Build Command : npm install
   - Start Command : node server.js
   - Plan        : Free
8. Cliquer "Advanced" → "Add Environment Variable" et ajouter CES 4 VARIABLES :

   Clé           | Valeur
   --------------|--------------------------------------------------
   FB_EMAIL      | ton_email@gmail.com
   FB_PASSWORD   | ton_mot_de_passe
   FB_PAGE_URL   | https://www.facebook.com/fabrizioromanoherewego
   PORT          | 3000

9. Cliquer "Create Web Service"
10. Attendre 3-5 minutes → Render te donne une URL du type :
    https://fabrizio-rss.onrender.com

Ton RSS sera sur : https://fabrizio-rss.onrender.com/rss

---

## ✅ ÉTAPE 7 — UptimeRobot (garder le bot éveillé 24h/24)

Sans cette étape, Render éteint le bot après 15 min d'inactivité.

1. Aller sur https://uptimerobot.com
2. Cliquer "Register for FREE" (pas de carte bancaire)
3. Créer un compte avec ton email
4. Cliquer "Add New Monitor"
5. Remplir :
   - Monitor Type       : HTTP(s)
   - Friendly Name      : Fabrizio Bot
   - URL                : https://fabrizio-rss.onrender.com/health
   - Monitoring Interval : 5 minutes
6. Cliquer "Create Monitor" ✅

---

## 🔗 Tes URLs finales

Dashboard  → https://fabrizio-rss.onrender.com/
Flux RSS   → https://fabrizio-rss.onrender.com/rss
Health     → https://fabrizio-rss.onrender.com/health
Statut     → https://fabrizio-rss.onrender.com/status

---

## 🧪 Utiliser le RSS dans un lecteur

Copier l'URL du flux RSS dans :
- Feedly    : https://feedly.com
- Inoreader : https://inoreader.com
- Tout lecteur RSS sur mobile

---

## 🔧 Problèmes courants

PROBLÈME : Build failed avec "node_modules" dans les erreurs
→ Tu as envoyé node_modules sur GitHub par erreur.
→ Dans le terminal, taper :
   git rm -r --cached node_modules
   git commit -m "fix: supprimer node_modules"
   git push
→ Ensuite dans Render : Manual Deploy → Deploy latest commit

PROBLÈME : "Connexion échouée"
→ Vérifier les variables d'environnement dans Render > Environment
→ S'assurer que FB_EMAIL et FB_PASSWORD sont corrects

PROBLÈME : Le serveur s'endort quand même
→ Vérifier que UptimeRobot pointe bien sur /health (pas sur /rss)
→ Vérifier que l'intervalle est bien 5 minutes

---

Coût total : 0€ — Sans carte bancaire — Durée : illimitée ✅
