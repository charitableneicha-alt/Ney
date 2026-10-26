# NEY — Vêtements personnalisés

Boutique en ligne entièrement statique (HTML / CSS / JavaScript, modules ES) pour composer
des vêtements personnalisés : t-shirt, sweat, hoodie, casquette, tote bag, mug.

Aucun build, aucune dépendance npm, aucun appel réseau : tout tourne dans le navigateur.
**Pas de gestion de stock** (chaque commande lance la fabrication) et **pas de livraison**
(le total correspond aux articles, remise déduite).

## Lancer en local

```bash
python3 -m http.server 3000 --bind 0.0.0.0
# puis http://localhost:3000
```

Un serveur statique est nécessaire : les modules ES ne fonctionnent pas via `file://`.

## Parcours

| Route | Contenu |
| --- | --- |
| `#/` | Accueil : héros, familles, sélection, bandeau personnalisation, avis |
| `#/boutique` | Catalogue filtrable (`?cat=`, `?q=`, `?tri=`) |
| `#/produit/:id` | Fiche produit + configurateur en direct |
| `#/panier` | Panier, quantités, code promo, total |
| `#/commande` | Coordonnées + moyen de paiement (simulé) |
| `#/confirmation/:id` | Confirmation de commande |
| `#/commandes` | Historique local des commandes |
| `#/personnalisation` | Étapes, techniques, tarifs, FAQ |
| `#/contact` | Coordonnées de l’atelier + formulaire |

## Règles tarifaires

- Prix de base = prix de la pièce (propre à chaque modèle).
- Texte personnalisé : **+ 4,90 €**.
- Logo / broderie : **+ 6,90 €**.
- Total = (prix de base + options) × quantité, puis remise éventuelle.
- Aucun frais de livraison, aucune gestion de stock.

Codes promo : `NEY10` (−10 %), `ATELIER15` (−15 % dès 120 € d’achat).

## Personnalisation

- Couleur de la pièce (5 à 6 teintes selon le modèle) et taille.
- Texte jusqu’à 24 caractères, 3 polices et 6 couleurs de texte.
- Logo PNG / JPG / WEBP / SVG, 500 Ko maximum (aperçu en direct).
- Emplacement : poitrine, dos ou manche selon le type de pièce.
- Les mockups des vêtements sont dessinés en SVG : aucune image externe n’est requise.

## Persistance

`localStorage` conserve le panier, le code promo, le brouillon de coordonnées et l’historique
des commandes. Tout est recalculé au chargement ; les données corrompues sont ignorées.
Les commandes ne sont jamais envoyées à un serveur.

## Structure

```
index.html
assets/favicon.svg
css/styles.css          design system complet (tokens, composants, responsive)
js/main.js              routeur par hash, en-tête, badge panier
js/data.js              catalogue, couleurs, options, code promo
js/state.js             panier, totaux, commandes, localStorage
js/ui.js                formatage, toasts, icônes, mockups SVG
js/components.js        cartes produit, titres de section, états vides
js/views/*.js           une vue par route
```

## Tests

```bash
node tests/state.test.mjs   # panier, tarifs, promo, commandes, persistance (28 assertions)
```

Le test de rendu bout-en-bout (jsdom) a également été exécuté en local : navigation sur les
9 routes, configurateur, upload de logo, promo, validation de formulaires et confirmation,
sans erreur console. Il nécessite `jsdom` installé hors dépôt (aucune dépendance n’est ajoutée
au projet pour rester 100 % statique).

## Déploiement

Le `Dockerfile` sert les fichiers statiques sur le port 3000, en écoutant sur `0.0.0.0`.
