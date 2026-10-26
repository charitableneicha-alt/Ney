/**
 * NEY — Données de la boutique
 * Catalogue, options de personnalisation, règles tarifaires.
 * Aucune dépendance : les visuels sont générés en SVG (voir ui.js).
 */

export const BRAND = {
  name: 'NEY',
  tagline: 'Vêtements personnalisés',
  city: 'Lyon',
  email: 'bonjour@ney-studio.fr',
  phone: '+33 4 78 00 12 34',
  address: '14 rue des Textiles, 69002 Lyon',
  hours: 'Lun — Ven, 9h30 à 18h',
};

/** Suppléments de personnalisation (en euros). */
export const CUSTOM_PRICES = {
  text: 4.9,
  logo: 6.9,
};

/**
 * Pas de stock : chaque pièce est fabriquée à la commande, le catalogue est
 * donc toujours disponible. Pas de livraison gérée non plus : le total
 * correspond strictement aux articles moins la remise éventuelle.
 */

/** Codes promotionnels : code -> { rate, label, min }. */
export const PROMO_CODES = {
  NEY10: { rate: 0.1, label: 'Bienvenue chez NEY', min: 0 },
  ATELIER15: { rate: 0.15, label: 'Offre atelier', min: 120 },
};

/** Options de paiement proposées au moment de la validation. */
export const PAYMENT_METHODS = [
  {
    id: 'carte',
    label: 'Carte bancaire',
    detail: 'Paiement simulé — aucune donnée transmise',
    icon: 'card',
  },
  {
    id: 'virement',
    label: 'Virement',
    detail: 'Les coordonnées sont affichées sur la confirmation',
    icon: 'bank',
  },
  {
    id: 'atelier',
    label: 'Réglé à l’atelier',
    detail: 'Vous réglez lors du retrait de votre pièce',
    icon: 'shop',
  },
];

export const COLORS = {
  ecru: { name: 'Écru', hex: '#f0e8d8', ink: '#2a2620' },
  noir: { name: 'Noir encre', hex: '#22201d', ink: '#f6f1ea' },
  sable: { name: 'Sable', hex: '#d8c6a8', ink: '#2a2620' },
  argile: { name: 'Argile', hex: '#b1532f', ink: '#fdf6ee' },
  olive: { name: 'Olive', hex: '#5c6650', ink: '#f4f1e6' },
  marine: { name: 'Marine', hex: '#2c3b50', ink: '#f2f0e8' },
  rose: { name: 'Rose poudré', hex: '#e3c3bb', ink: '#3a2a26' },
  moutarde: { name: 'Moutarde', hex: '#c69b5a', ink: '#2b2415' },
};

/** Types de vêtement rendus par le générateur SVG. */
export const GARMENT_TYPES = ['tshirt', 'sweat', 'hoodie', 'cap', 'tote', 'mug'];

export const CATEGORIES = [
  { id: 'tshirts', label: 'T-shirts', copy: 'Coton bio 220 g, coupe droite', type: 'tshirt' },
  { id: 'sweats', label: 'Sweats & hoodies', copy: 'Molleton gratté 380 g', type: 'sweat' },
  { id: 'casquettes', label: 'Casquettes', copy: 'Sergé de coton, broderie au choix', type: 'cap' },
  { id: 'accessoires', label: 'Accessoires', copy: 'Tote bags, mugs, petites pièces', type: 'tote' },
];

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const PRODUCTS = [
  {
    id: 'tshirt-essential',
    name: 'T-shirt Essential',
    category: 'tshirts',
    type: 'tshirt',
    fit: 'droite unisexe',
    price: 24.9,
    colors: ['ecru', 'noir', 'sable', 'olive', 'argile'],
    sizes: ALL_SIZES,
    badge: 'Best-seller',
    rating: 4.8,
    reviews: 214,
    tone: 'sand',
    short: 'Notre basique en coton bio peigné, parfait pour une première personnalisation.',
    description:
      'Le T-shirt Essential est taillé dans un jersey de coton biologique 220 g/m², peigné et pré-rétréci. Col côtelé, coutures latérales, épaules renforcées : il garde sa forme lavage après lavage. C’est notre support préféré pour les textes et les logos, car la surface d’impression est large et bien plane.',
    details: [
      '100 % coton biologique certifié GOTS',
      '220 g/m², jersey peigné et pré-rétréci',
      'Coupe droite unisexe, épaules tombantes',
      'Lavable à 30 °C, retourné',
    ],
  },
  {
    id: 'tshirt-heavy',
    name: 'T-shirt Heavy',
    category: 'tshirts',
    type: 'tshirt',
    fit: 'boxy unisexe',
    price: 32.0,
    colors: ['ecru', 'noir', 'marine', 'moutarde'],
    sizes: ALL_SIZES,
    badge: null,
    rating: 4.7,
    reviews: 96,
    tone: 'ink',
    short: 'Grammage épais, tombé franc, pour les pièces graphiques affirmées.',
    description:
      'Une version plus dense de notre basique : 260 g/m², coton cardé, col double épaisseur. Le tombé est plus structuré, ce qui met particulièrement bien en valeur les impressions grand format et les lettrages typographiques.',
    details: [
      '100 % coton cardé 260 g/m²',
      'Col double épaisseur, tenue renforcée',
      'Coupe boxy unisexe',
      'Zone d’impression 30 × 38 cm',
    ],
  },
  {
    id: 'sweat-crew',
    name: 'Sweat Crew',
    category: 'sweats',
    type: 'sweat',
    fit: 'oversize',
    price: 58.0,
    colors: ['ecru', 'sable', 'olive', 'marine', 'rose'],
    sizes: ALL_SIZES,
    badge: 'Nouveau',
    rating: 4.9,
    reviews: 143,
    tone: 'olive',
    short: 'Molleton gratté 380 g, col rond côtelé, la pièce cocon de la maison.',
    description:
      'Le Sweat Crew est monté dans un molleton de coton gratté à l’intérieur, 380 g/m². Bords côtes aux poignets et à la taille, col rond côtelé, coupe légèrement oversize. La broderie y prend une texture mate et nette, très agréable au toucher.',
    details: [
      '85 % coton, 15 % polyester recyclé — 380 g/m²',
      'Intérieur gratté doux',
      'Bords côtes élasthanne',
      'Coupe oversize, épaules tombantes',
    ],
  },
  {
    id: 'hoodie-atelier',
    name: 'Hoodie Atelier',
    category: 'sweats',
    type: 'hoodie',
    fit: 'oversize',
    price: 68.0,
    colors: ['noir', 'ecru', 'sable', 'argile'],
    sizes: ALL_SIZES,
    badge: 'Édition atelier',
    rating: 4.9,
    reviews: 187,
    tone: 'clay',
    short: 'Capuche doublée, poche kangourou, l’uniforme de l’atelier.',
    description:
      'Capuche doublée double épaisseur, cordon en coton ciré avec embouts métal, poche kangourou surpiquée. Le Hoodie Atelier est notre pièce la plus portée — la zone poitrine reste parfaitement lisible, même avec un logo fin.',
    details: [
      'Molleton 400 g/m², coton majoritaire',
      'Capuche doublée, cordon coton ciré',
      'Poche kangourou surpiquée',
      'Poignets et taille côtelés',
    ],
  },
  {
    id: 'sweat-zip',
    name: 'Sweat zippé Studio',
    category: 'sweats',
    type: 'hoodie',
    fit: 'ajustée',
    price: 72.0,
    colors: ['sable', 'olive', 'noir', 'marine'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    badge: null,
    rating: 4.6,
    reviews: 61,
    tone: 'sand',
    short: 'Zip métal YKK, col montant, idéal sous une veste.',
    description:
      'Un zippé fin et net, zip métal YKK intégral, col montant doublé. Sa coupe plus ajustée que le Hoodie Atelier en fait une pièce facile à superposer. Nous conseillons une broderie poitrine ou un texte court sur le col.',
    details: [
      'Molleton 360 g/m²',
      'Zip métal YKK intégral',
      'Col montant doublé',
      'Coupe ajustée, taille normale',
    ],
  },
  {
    id: 'casquette-classic',
    name: 'Casquette Classic',
    category: 'casquettes',
    type: 'cap',
    fit: 'ajustable',
    price: 29.0,
    colors: ['sable', 'noir', 'olive', 'marine'],
    sizes: ['Taille unique'],
    badge: 'Personnalisable',
    rating: 4.7,
    reviews: 78,
    tone: 'ink',
    short: 'Sergé de coton, six panneaux, fermeture métal réglable.',
    description:
      'Six panneaux en sergé de coton, visière incurvée préformée, œillets brodés, fermeture métal réglable. La broderie frontale met en valeur votre logo ou vos initiales, jusqu’à 12 caractères.',
    details: [
      '100 % sergé de coton',
      '6 panneaux, visière préformée',
      'Fermeture métal réglable',
      'Zone de broderie frontale 8 cm',
    ],
  },
  {
    id: 'casquette-trucker',
    name: 'Casquette Trucker',
    category: 'casquettes',
    type: 'cap',
    fit: 'haute, ajustable',
    price: 34.0,
    colors: ['ecru', 'marine', 'argile'],
    sizes: ['Taille unique'],
    badge: null,
    rating: 4.5,
    reviews: 42,
    tone: 'clay',
    short: 'Face avant coton, dos filet respirant, esprit route.',
    description:
      'Face avant en coton épais, arrière en filet respirant, profil légèrement plus haut. Une casquette d’été qui accepte très bien un patch brodé ou un texte en arc.',
    details: [
      'Face coton, dos filet polyester',
      'Profil haut, visière plate',
      'Fermeture snapback',
      'Zone de broderie frontale 8 cm',
    ],
  },
  {
    id: 'tote-canvas',
    name: 'Tote bag Canvas',
    category: 'accessoires',
    type: 'tote',
    fit: 'unique',
    price: 19.0,
    colors: ['ecru', 'sable', 'noir', 'olive'],
    sizes: ['Taille unique'],
    badge: 'Petit prix',
    rating: 4.8,
    reviews: 132,
    tone: 'sand',
    short: 'Toile de coton épaisse, anses longues, format marché.',
    description:
      'Un tote en toile de coton 340 g/m², anses longues renforcées, fond plat. Il tient debout tout seul et se personnalise à merveille : texte centré, logo pleine face ou petite signature en bas à droite.',
    details: [
      'Toile de coton 340 g/m²',
      'Anses longues 70 cm renforcées',
      'Dimensions 38 × 42 cm',
      'Impression une ou deux faces',
    ],
  },
  {
    id: 'mug-enamel',
    name: 'Mug émaillé',
    category: 'accessoires',
    type: 'mug',
    fit: '33 cl',
    price: 16.0,
    colors: ['ecru', 'noir', 'argile', 'olive'],
    sizes: ['33 cl'],
    badge: null,
    rating: 4.4,
    reviews: 55,
    tone: 'olive',
    short: 'Émail vitrifié, liseré contrasté, résistant au lave-vaisselle.',
    description:
      'Un mug en acier émaillé, 33 cl, liseré contrasté. L’émail vitrifié donne une finition légèrement irrégulière, voulue. Personnalisation par impression UV, tenue garantie au lave-vaisselle.',
    details: [
      'Acier émaillé, 33 cl',
      'Liseré contrasté, anse large',
      'Impression UV résistante',
      'Compatible lave-vaisselle',
    ],
  },
  {
    id: 'tshirt-kids',
    name: 'T-shirt Kids',
    category: 'tshirts',
    type: 'tshirt',
    fit: 'enfant',
    price: 19.5,
    colors: ['ecru', 'rose', 'moutarde', 'marine'],
    sizes: ['4 ans', '6 ans', '8 ans', '10 ans', '12 ans'],
    badge: null,
    rating: 4.8,
    reviews: 89,
    tone: 'clay',
    short: 'Coton bio doux, coupe enfant, impressions lavables.',
    description:
      'Le même coton biologique que nos t-shirts adultes, dans une coupe pensée pour bouger : emmanchures souples, col élasthanne qui ne se détend pas. Les encres à l’eau résistent aux lavages répétés.',
    details: [
      '100 % coton biologique 180 g/m²',
      'Col élasthanne, emmanchures souples',
      'Encres à l’eau sans solvant',
      'De 4 à 12 ans',
    ],
  },
  {
    id: 'sweat-kids',
    name: 'Sweat Kids',
    category: 'sweats',
    type: 'sweat',
    fit: 'enfant',
    price: 42.0,
    colors: ['ecru', 'rose', 'olive', 'marine'],
    sizes: ['4 ans', '6 ans', '8 ans', '10 ans', '12 ans'],
    badge: null,
    rating: 4.7,
    reviews: 51,
    tone: 'olive',
    short: 'Molleton doux, poignets côtelés, pour les petits ateliers.',
    description:
      'Un molleton léger 300 g/m², doux dès le premier lavage, avec poignets et bas côtelés. Parfait pour un prénom brodé ou un petit motif poitrine.',
    details: [
      'Molleton 300 g/m², coton majoritaire',
      'Poignets et bas côtelés',
      'Coupe enfant confort',
      'De 4 à 12 ans',
    ],
  },
  {
    id: 'casquette-kids',
    name: 'Casquette Kids',
    category: 'casquettes',
    type: 'cap',
    fit: 'ajustable',
    price: 24.0,
    colors: ['sable', 'rose', 'marine', 'ecru'],
    sizes: ['Taille unique'],
    badge: null,
    rating: 4.6,
    reviews: 33,
    tone: 'sand',
    short: 'Sangle scratch, visière souple, broderie prénom en option.',
    description:
      'Pensée pour les têtes qui bougent : sangle scratch réglable, visière souple, sergé lavable. La broderie prénom se place à l’avant, en lettres nettes.',
    details: [
      'Sergé de coton lavable',
      'Sangle scratch réglable',
      'Visière souple',
      'Zone de broderie prénom 7 cm',
    ],
  },
];

/** Placements disponibles selon le type de vêtement. */
export const PLACEMENTS = {
  tshirt: [
    { id: 'poitrine', label: 'Poitrine' },
    { id: 'dos', label: 'Dos' },
    { id: 'manche', label: 'Manche' },
  ],
  sweat: [
    { id: 'poitrine', label: 'Poitrine' },
    { id: 'dos', label: 'Dos' },
    { id: 'manche', label: 'Manche' },
  ],
  hoodie: [
    { id: 'poitrine', label: 'Poitrine' },
    { id: 'dos', label: 'Dos' },
  ],
  cap: [
    { id: 'poitrine', label: 'Face avant' },
    { id: 'manche', label: 'Côté' },
  ],
  tote: [
    { id: 'poitrine', label: 'Face centrale' },
    { id: 'dos', label: 'Face arrière' },
  ],
  mug: [{ id: 'poitrine', label: 'Face visible' }],
};

/** Polices de personnalisation proposées. */
export const FONTS = [
  { id: 'sans', label: 'Sans-serif épurée', family: 'Inter, Helvetica, Arial, sans-serif' },
  { id: 'serif', label: 'Serif éditoriale', family: '"Cormorant Garamond", Georgia, serif' },
  { id: 'mono', label: 'Monospace technique', family: 'ui-monospace, "SF Mono", Menlo, monospace' },
];

export const MAX_TEXT_LENGTH = 24;

/* -------------------------------------------------------------------------- */
/* Sélecteurs                                                                  */
/* -------------------------------------------------------------------------- */

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null;
}

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null;
}

export function getColor(key) {
  return COLORS[key] || COLORS.ecru;
}

export function getPlacements(type) {
  return PLACEMENTS[type] || PLACEMENTS.tshirt;
}

export function getPlacementLabel(type, id) {
  const found = getPlacements(type).find((p) => p.id === id);
  return found ? found.label : id;
}

export function getFont(id) {
  return FONTS.find((f) => f.id === id) || FONTS[0];
}

export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find((m) => m.id === id) || PAYMENT_METHODS[0];
}

export function categoryCount(catId) {
  return PRODUCTS.filter((p) => p.category === catId).length;
}

export function relatedProducts(product, limit = 4) {
  if (!product) return PRODUCTS.slice(0, limit);
  const same = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id);
  const others = PRODUCTS.filter((p) => p.category !== product.category && p.id !== product.id);
  return [...same, ...others].slice(0, limit);
}

export function bestSellers(limit = 4) {
  return [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, limit);
}

export function newArrivals(limit = 4) {
  return PRODUCTS.filter((p) => p.badge).slice(0, limit);
}
