VIDÉONOVA AI — PREMIÈRE VERSION

Cette version est un prototype : elle permet de lancer des générations de clips courts avec le modèle alibaba/wan-3 de Replicate, de prévisualiser le résultat et de télécharger le fichier renvoyé par Replicate.

MISE EN LIGNE AVEC GITHUB + NETLIFY
1. Décompresse le dossier.
2. Ajoute tous les fichiers à ton dépôt GitHub (à la racine, index.html doit être visible à la racine).
3. Dans Netlify, importe le dépôt GitHub comme nouveau site.
4. Dans Netlify > Site configuration > Environment variables, ajoute :
   REPLICATE_API_TOKEN = ton jeton Replicate actif.
5. Redéploie le site après avoir enregistré la variable.
6. Ouvre l’URL Netlify et teste une vidéo courte.

SÉCURITÉ
- Ne colle jamais le jeton Replicate dans index.html, app.js, GitHub, ou dans un message.
- Le jeton doit rester uniquement dans les variables d’environnement Netlify.
- Le moteur Replicate peut facturer chaque génération. Vérifie les tarifs du modèle avant les tests.

LIMITES DE CETTE VERSION
- Génération de clips courts, pas encore de films de 1–5 ou 10–20 minutes.
- La section « Créer un film » présente le parcours prévu mais l’assemblage multi-scènes n’est pas encore implémenté.
- Le prix de 25 $ par film est affiché comme tarif prévu seulement. Aucun paiement n’est collecté : il faudra intégrer un système de paiement et des contrôles côté serveur avant l’ouverture publique.
- Le modèle et ses champs peuvent évoluer ; consulte https://replicate.com/alibaba/wan-3 pour le schéma à jour.
