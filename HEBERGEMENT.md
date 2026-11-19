# Mettre en ligne MICHOU SHOOP (gratuit)

Le site est 100 % statique (HTML + `app.js`) : aucun serveur à installer. Vercel et Netlify offrent un plan gratuit, avec HTTPS automatique. Leur disponibilité depuis la Guinée n'a pas pu être vérifiée : si l'un est inaccessible, essayez l'autre (ou un VPN).

## Avant de commencer
1. Dézippez l'archive : `index.html`, `app.js`, les pages légales, `favicon.svg`, etc. doivent être à la racine du dossier.
2. Après la mise en ligne, remplacez `https://votre-domaine.com` par votre lien réel dans `index.html`, `sitemap.xml`, `robots.txt`, puis redéployez.
3. Configurez la base de données en ligne (section « Base de données Supabase » ci-dessous) : sans elle, le catalogue reste local à chaque navigateur.
4. Ouvrez le site, passez en « Mode gestion » (e-mail + mot de passe), puis renseignez votre numéro Orange Money (bouton « Paramètres Orange Money »).

## Option A — Netlify (le plus simple)
1. Créez un compte gratuit sur netlify.com (e-mail).
2. « Add new site » → « Deploy manually » (ou glissez-déposez sur app.netlify.com/drop).
3. Glissez le DOSSIER dézippé du site dans la zone de dépôt.
4. Quelques secondes plus tard, Netlify affiche le lien `https://nom.netlify.app` : c'est le lien d'accès à donner à vos clients.
5. Optionnel : « Site configuration » → « Change site name » pour un nom lisible (ex. michou-shoop).

## Option B — Vercel
1. Créez un compte gratuit sur vercel.com.
2. Sans GitHub : installez Node.js, puis dans le dossier du site lancez `npx vercel` (Framework : Other, pas de build). Avec GitHub : déposez les fichiers dans un dépôt, « Add New… » → « Project », importez-le, champs de build vides.
3. Vercel affiche le lien `https://nom.vercel.app` : c'est votre lien d'accès.

## Base de données Supabase (gratuite) : catalogue visible par tous
Le catalogue est lu et écrit dans une base Supabase : ce que vous modifiez (depuis votre téléphone aussi) est visible par tous les visiteurs (rafraîchissement automatique toutes les 15 s et au retour sur la page). Les visiteurs ne peuvent que lire ; seul le compte propriétaire peut ajouter, modifier ou supprimer.

1. Créez un compte gratuit sur supabase.com, puis « New project » (nom : michou-shoop, choisissez un mot de passe de base, région proche, plan Free).
2. Menu « SQL Editor » → « New query » : collez tout le contenu de `supabase.sql` → « Run ». Cela crée les tables `products` et `settings` avec leurs règles d'accès (lecture publique, écriture réservée aux utilisateurs connectés).
3. Menu « Authentication » → « Users » → « Add user » → « Create new user » : saisissez VOTRE e-mail et un mot de passe solide, cochez « Auto Confirm User ».
4. Menu « Authentication » → « Sign In / Providers » : désactivez « Allow new users to sign up » (sinon n'importe qui pourrait créer un compte et modifier le catalogue).
5. Menu « Project Settings » → « API » : copiez « Project URL » et la clé « anon public ».
6. Ouvrez `config.js` et collez-les :
   `SUPABASE_URL: "https://xxxx.supabase.co"` et `SUPABASE_ANON_KEY: "eyJ..."`. La clé anon est publique par conception ; la sécurité vient des règles de l'étape 2. Ne publiez jamais la clé « service_role ».
7. Republiez le dossier (Netlify : redéposez-le ; Vercel : `npx vercel --prod`).
8. Sur le site (ordinateur ou téléphone) : « Mode gestion (propriétaire) » → connectez-vous → les boutons Ajouter / Modifier / Supprimer apparaissent dans chaque catégorie. Au premier chargement, la base vide est remplie avec les 6 articles d'exemple.

## Important
- Le catalogue est dans Supabase (tant que `config.js` est vide, le site retombe sur le stockage local du navigateur, visible uniquement sur l'appareil du propriétaire). Le panier reste dans le navigateur de chaque client.
- L'accès en écriture est protégé côté serveur (connexion + règles RLS), pas par un code dans la page.
- Je n'ai pas pu tester la connexion à Supabase depuis cet environnement : testez après l'étape 7 (ajoutez un article, ouvrez le lien sur un autre appareil).
- Le paiement Orange Money est manuel : le client envoie le montant au numéro indiqué et saisit la référence ; vous vérifiez la réception avant de livrer.
- Mise à jour : Netlify → redéposez le dossier ; Vercel → `npx vercel --prod`.
