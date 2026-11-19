# MICHOU SHOOP — site statique

Boutique en ligne statique (HTML/CSS/JS) avec catalogue et paramètres Orange Money stockés dans une base Supabase. Les modifications du propriétaire sont visibles par tous les visiteurs (synchronisation toutes les 15 s).

## Contenu de l'archive

- `index.html` : page principale de la boutique
- `app.js` : logique du site (catalogue, panier, espace propriétaire, connexion Supabase)
- `config.js` : paramètres de connexion (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
- `supabase.sql` : création des tables `products` et `settings` et règles de sécurité (RLS)
- `conditions-generales.html`, `politique-confidentialite.html`, `404.html` : pages légales et page d'erreur
- `favicon.svg`, `social-preview.svg`, `robots.txt`, `sitemap.xml` : icône, aperçu de partage et référencement
- `netlify.toml`, `vercel.json`, `.htaccess` : configuration d'hébergement
- `HEBERGEMENT.md` : guide d'hébergement

## Mise en route

1. Créez un compte sur https://supabase.com, puis un projet gratuit (par exemple `michou-shoop`).
2. Dans **SQL Editor**, collez le contenu de `supabase.sql` et cliquez sur **Run**.
3. Dans **Authentication → Users → Add user**, créez le compte du propriétaire (e-mail et mot de passe).
4. Dans **Project Settings → API**, copiez l'URL du projet et la clé `anon`, puis renseignez-les dans `config.js`.
5. Mettez le dossier en ligne, par exemple via https://app.netlify.com/drop (`index.html` doit être à la racine du dossier).

## Utilisation

- Les visiteurs consultent le catalogue ; seul le propriétaire connecté (e-mail / mot de passe) peut ajouter, modifier ou supprimer des produits et changer les paramètres Orange Money.
- Sans configuration dans `config.js`, le site ne fonctionne pas en mode en ligne.

## Sécurité

- Ne publiez jamais la clé `service_role` de Supabase ; seule la clé `anon` va dans `config.js`.
- Les droits d'écriture sont limités au propriétaire connecté par les règles RLS de `supabase.sql`.

Pour plus de détails sur l'hébergement, consultez `HEBERGEMENT.md`.
