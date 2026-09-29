# VYRO — site vitrine

Site vitrine responsive en français pour une petite agence indépendante de création de sites web.

Le dossier de départ étant vide, le site s'appuie sur HTML, CSS et JavaScript natifs : il s'agit d'une page vitrine qui peut être servie directement et n'a pas besoin d'une chaîne de compilation. Le contenu est organisé par sections sémantiques dans `index.html`, le style est regroupé dans `styles.css` et les comportements (menu, animations, SEO conditionnel et formulaire) sont séparés dans `app.js`.

## Lancer en local

Le site ne demande ni compilation ni installation de dépendances. Servez le dossier `dist` avec un serveur HTTP statique, par exemple `cd dist` puis `python -m http.server 4173`, et ouvrez `http://localhost:4173`.

## Publier sur GitHub Pages

Le dépôt est préparé pour GitHub Pages avec GitHub Actions. Le workflow publie `dist` à chaque push sur `main`. Il calcule l’URL du projet à partir du nom du dépôt et met à jour `config.js`, `robots.txt` et `sitemap.xml` pendant le déploiement. Les liens HTML sont relatifs pour fonctionner aussi sous le chemin `/nom-du-depot/`.

Les commandes ci-dessous utilisent le dossier de travail déjà préparé, qui contient une branche locale `main`. Si vous utilisez plutôt le ZIP, extrayez-le puis lancez `git init -b main` une seule fois dans le dossier extrait avant d’ajouter le dépôt distant.

### Première publication

1. Créez un dépôt vide sur GitHub, par exemple `vyro-site`. Ne cochez pas les options pour ajouter un README, un `.gitignore` ou une licence : le projet possède déjà son dépôt local et sa branche `main`.
2. Dans PowerShell, ouvrez le dossier du projet :

   ```powershell
   Set-Location "C:\Users\loulo\Documents\Codex\2026-09-29\tou\outputs\vyro-site"
   ```

3. Remplacez `<VOTRE-UTILISATEUR>` et `<NOM-DU-DEPOT>` par les valeurs de votre dépôt GitHub, puis ajoutez le dépôt distant :

   ```powershell
   git remote add github https://github.com/<VOTRE-UTILISATEUR>/<NOM-DU-DEPOT>.git
   ```

4. Enregistrez et poussez la préparation :

   ```powershell
   git add .
   git commit -m "Préparer le déploiement GitHub Pages"
   git push -u github main
   ```

5. Sur GitHub, ouvrez **Settings → Pages**. Sous **Build and deployment**, choisissez **GitHub Actions** comme source.
6. Ouvrez l’onglet **Actions** et attendez la réussite de **Deploy to GitHub Pages**. GitHub affiche ensuite l’URL publiée dans les détails du déploiement. Pour un dépôt ordinaire, elle est de la forme `https://<VOTRE-UTILISATEUR>.github.io/<NOM-DU-DEPOT>/`. Un dépôt nommé `<VOTRE-UTILISATEUR>.github.io` est publié à la racine `https://<VOTRE-UTILISATEUR>.github.io/`.

Pour les mises à jour suivantes, utilisez `git add .`, `git commit -m "Mettre à jour le site"`, puis `git push github main`. Le workflow republie le site automatiquement.

Avec GitHub Free, GitHub Pages est disponible pour les dépôts publics. La publication depuis un dépôt privé nécessite un forfait GitHub qui inclut Pages pour les dépôts privés.

## Avant la mise en ligne

1. Modifiez `config.js` si les coordonnées, le nom du responsable ou les réseaux sociaux changent.
2. Remplacez `example.com` par le domaine officiel dans `robots.txt` et `sitemap.xml`.
3. Complétez les informations de l'entreprise et de l'hébergeur dans `mentions-legales.html`.
4. Vérifiez la politique de confidentialité dans `confidentialite.html` après avoir choisi l'hébergement des demandes et leur durée de conservation.
5. Remplacez les illustrations de concepts par de vrais projets uniquement lorsque vous disposez des visuels et autorisations nécessaires.

Les coordonnées visibles et les liens de contact utilisent les valeurs renseignées dans `config.js`.

## Formulaire

Le parcours en cinq étapes valide les champs, affiche les erreurs et permet de relire le récapitulatif. Sans `formEndpoint`, le bouton de fin ouvre le logiciel de messagerie de l’utilisateur avec une demande préremplie adressée à l’agence. L’utilisateur doit confirmer l’envoi dans ce logiciel. Le site n’affiche pas cette étape comme un envoi automatique.

Pour connecter un backend, configurez `formEndpoint` avec l'URL HTTPS du service choisi. Celui-ci doit accepter une requête `POST` avec `Content-Type: application/json`, autoriser l'origine du site et répondre avec un statut HTTP 2xx après réception effective. Le serveur doit refaire sa propre validation et définir ses protections contre les abus. Le corps transmis contient `business`, `name`, `sector`, `needs`, `details`, `email`, `phone`, `website` et `consent`.

## SEO

Le titre, la description, les cartes Open Graph, la carte Twitter, le favicon, `robots.txt` et le sitemap sont inclus. Le lien canonical et les données structurées `ProfessionalService` sont ajoutés seulement quand un `siteUrl` HTTPS réel est renseigné. Les données structurées n'incluent que les champs réels ajoutés à `config.js`.

## Fichiers

- `dist/index.html` — page et contenu
- `dist/styles.css` — identité visuelle et règles responsive
- `dist/app.js` — menu, animations accessibles, configuration SEO et formulaire
- `dist/config.js` — informations centralisées à remplacer
- `dist/mentions-legales.html` et `dist/confidentialite.html` — pages à finaliser avant publication
- `dist/images/` — visuels des trois projets conceptuels
- `dist/favicon.svg` — favicon VYRO
- `.openai/hosting.json` — configuration de publication statique
- `.github/workflows/deploy-pages.yml` — déploiement automatique GitHub Pages
- `scripts/prepare-github-pages.mjs` — adaptation du domaine et du sitemap au nom du dépôt
