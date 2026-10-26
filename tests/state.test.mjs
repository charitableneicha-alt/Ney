/**
 * NEY — Tests de la logique métier (panier, tarifs, promo, commandes).
 * Exécution : node tests/state.test.mjs
 * Un localStorage en mémoire est fourni pour isoler les tests du navigateur.
 */

import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const moduleUrl = (rel) => pathToFileURL(path.resolve(here, rel)).href;

const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  },
};

const state = await import(moduleUrl('../js/state.js'));
const data = await import(moduleUrl('../js/data.js'));

let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  const suffix = ok ? '' : ` (attendu ${JSON.stringify(expected)})`;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label} -> ${JSON.stringify(actual)}${suffix}`);
};

/* 1. Prix de base + texte (24,90 + 4,90) */
const added = state.addToCart({
  productId: 'tshirt-essential',
  qty: 2,
  color: 'ecru',
  size: 'M',
  text: 'NEYA',
  font: 'sans',
  textColor: 'noir',
  placement: 'poitrine',
});
check('ajout panier', added.ok, true);
check('quantité totale', state.cartCount(), 2);
check('sous-total avec texte', state.cartSubtotal(), 59.6);

/* 2. Configuration identique fusionnée */
state.addToCart({
  productId: 'tshirt-essential',
  qty: 1,
  color: 'ecru',
  size: 'M',
  text: 'NEYA',
  font: 'sans',
  textColor: 'noir',
  placement: 'poitrine',
});
check('lignes fusionnées', state.getCart().length, 1);
check('quantité fusionnée', state.cartCount(), 3);
check('sous-total fusionné', state.cartSubtotal(), 89.4);

/* 3. Ligne avec logo (68 + 6,90) */
state.addToCart({
  productId: 'hoodie-atelier',
  qty: 1,
  color: 'noir',
  size: 'L',
  logo: { name: 'logo.png', dataUrl: 'data:image/png;base64,AAAA' },
});
check('deux lignes', state.getCart().length, 2);
check('sous-total complet', state.cartSubtotal(), 164.3);

/* 4. Codes promo */
check('promo inconnue refusée', state.applyPromo('XXX').ok, false);
check('promo vide refusée', state.applyPromo('').ok, false);
check('promo NEY10 acceptée', state.applyPromo('ney10').ok, true);
check('totaux avec remise', state.getTotals(), {
  subtotal: 164.3,
  discount: 16.43,
  total: 147.87,
  promo: { code: 'NEY10', rate: 0.1, label: 'Bienvenue chez NEY', min: 0 },
  count: 4,
});

/* 5. Quantité invalide ramenée à 1 puis total recalculé */
state.updateQty(state.getCart()[0].id, 0);
check('quantité minimale', state.getCart()[0].qty, 1);
check('total après quantité minimale', state.getTotals().total, 94.23);

/* 6. Commande : enregistrement, vidage, historique */
const placed = state.placeOrder({
  customer: {
    firstName: 'Camille',
    lastName: 'Renaud',
    email: 'camille@ney-studio.fr',
    phone: '0612345678',
    city: 'Lyon',
    zip: '69002',
    note: '',
  },
  payment: { id: 'carte', label: 'Carte bancaire' },
});
check('commande enregistrée', placed.ok, true);
check('total de la commande', placed.order.totals.total, 94.23);
check('clés de totaux sans livraison', Object.keys(placed.order.totals).sort(), [
  'count',
  'discount',
  'subtotal',
  'total',
]);
check('panier vidé', state.cartIsEmpty(), true);
check('promo effacée', state.getPromo(), null);
check('historique', state.getOrders().length, 1);
check('recherche par id', Boolean(state.getOrder(placed.order.id)), true);
check('recherche par numéro', Boolean(state.getOrder(placed.order.number)), true);

/* 7. Prix unitaires */
const cap = data.getProduct('casquette-classic');
check('prix nu', state.unitPriceFor(cap, {}), 29);
check('prix avec texte', state.unitPriceFor(cap, { text: 'NEY' }), 33.9);
check('prix avec logo', state.unitPriceFor(cap, { logo: { dataUrl: 'data:image/png;base64,A' } }), 35.9);

/* 8. Persistance relue depuis le même stockage */
const reloaded = await import(`${moduleUrl('../js/state.js')}?reload=1`);
check('commandes persistées', reloaded.getOrders().length, 1);
check('panier vide persisté', reloaded.cartIsEmpty(), true);

/* 9. Données corrompues ignorées silencieusement */
store.set('ney:cart:v1', '{pas du json');
const broken = await import(`${moduleUrl('../js/state.js')}?reload=2`);
check('panier corrompu ignoré', broken.cartIsEmpty(), true);

console.log(`\n${failures === 0 ? 'OK' : 'ECHEC'} — ${failures} échec(s)`);
process.exit(failures ? 1 : 0);
