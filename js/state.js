/**
 * NEY — État de l'application
 * Panier, code promo et commandes, persistés dans localStorage.
 * Aucun stock, aucune livraison : le total = articles − remise.
 */

import { CUSTOM_PRICES, PROMO_CODES, getProduct } from './data.js';
import { formatPrice } from './ui.js';

const STORAGE = {
  cart: 'ney:cart:v1',
  orders: 'ney:orders:v1',
  promo: 'ney:promo:v1',
  customer: 'ney:customer:v1',
};

const MAX_QTY = 20;

/* -------------------------------------------------------------------------- */
/* Persistance                                                                 */
/* -------------------------------------------------------------------------- */

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null || parsed === undefined ? fallback : parsed;
  } catch (err) {
    console.warn('[NEY] Lecture du stockage impossible :', key, err);
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn('[NEY] Écriture du stockage impossible :', key, err);
    return false;
  }
}

export function storageAvailable() {
  try {
    const probe = '__ney_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch (err) {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Utilitaires numériques                                                      */
/* -------------------------------------------------------------------------- */

export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function clampQty(qty) {
  const n = Math.floor(Number(qty));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_QTY);
}

/* -------------------------------------------------------------------------- */
/* État                                                                        */
/* -------------------------------------------------------------------------- */

const state = {
  cart: [],
  promoCode: null,
  orders: [],
  customer: {},
};

function sanitiseLogo(logo) {
  if (!logo || typeof logo !== 'object') return null;
  if (typeof logo.dataUrl !== 'string') return null;
  if (!logo.dataUrl.startsWith('data:image/')) return null;
  return {
    name: typeof logo.name === 'string' ? logo.name.slice(0, 120) : 'logo',
    dataUrl: logo.dataUrl,
  };
}

function sanitiseLine(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const product = getProduct(raw.productId);
  if (!product) return null;
  const color = product.colors.includes(raw.color) ? raw.color : product.colors[0];
  const size = product.sizes.includes(raw.size) ? raw.size : product.sizes[0];
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : uid('ci'),
    productId: product.id,
    qty: clampQty(raw.qty),
    color,
    size,
    text: typeof raw.text === 'string' ? raw.text.slice(0, 40) : '',
    textColor: typeof raw.textColor === 'string' ? raw.textColor : 'noir',
    font: typeof raw.font === 'string' ? raw.font : 'sans',
    placement: typeof raw.placement === 'string' ? raw.placement : 'poitrine',
    logo: sanitiseLogo(raw.logo),
    addedAt: typeof raw.addedAt === 'string' ? raw.addedAt : new Date().toISOString(),
  };
}

function loadCart() {
  const stored = read(STORAGE.cart, []);
  if (!Array.isArray(stored)) return [];
  return stored.map(sanitiseLine).filter(Boolean);
}

state.cart = loadCart();
state.promoCode = typeof read(STORAGE.promo, null) === 'string' ? read(STORAGE.promo, null) : null;

const storedOrders = read(STORAGE.orders, []);
state.orders = Array.isArray(storedOrders) ? storedOrders.filter((o) => o && o.id && Array.isArray(o.items)) : [];

const storedCustomer = read(STORAGE.customer, {});
state.customer = storedCustomer && typeof storedCustomer === 'object' ? storedCustomer : {};

/* -------------------------------------------------------------------------- */
/* Abonnements                                                                 */
/* -------------------------------------------------------------------------- */

const listeners = new Set();

export function subscribe(fn) {
  if (typeof fn !== 'function') return () => {};
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.error('[NEY] Erreur dans un abonné :', err);
    }
  });
}

function persistCart() {
  if (!write(STORAGE.cart, state.cart)) {
    console.warn('[NEY] Le panier est trop volumineux pour être sauvegardé (logos).');
  }
  emit();
}

/* -------------------------------------------------------------------------- */
/* Identifiants                                                                */
/* -------------------------------------------------------------------------- */

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/* -------------------------------------------------------------------------- */
/* Tarification                                                                */
/* -------------------------------------------------------------------------- */

export function unitPriceFor(product, config = {}) {
  if (!product) return 0;
  let price = product.price;
  if (config.text && String(config.text).trim()) price += CUSTOM_PRICES.text;
  if (config.logo && config.logo.dataUrl) price += CUSTOM_PRICES.logo;
  return round2(price);
}

export function getCart() {
  return state.cart.map((line) => ({ ...line }));
}

export function getCartDetailed() {
  return state.cart
    .map((line) => {
      const product = getProduct(line.productId);
      if (!product) return null;
      const unitPrice = unitPriceFor(product, line);
      return {
        item: line,
        product,
        unitPrice,
        lineTotal: round2(unitPrice * line.qty),
        customisationCost: round2(unitPrice - product.price),
      };
    })
    .filter(Boolean);
}

export function cartCount() {
  return state.cart.reduce((sum, line) => sum + line.qty, 0);
}

export function cartSubtotal() {
  return round2(getCartDetailed().reduce((sum, line) => sum + line.lineTotal, 0));
}

export function cartIsEmpty() {
  return state.cart.length === 0;
}

/* -------------------------------------------------------------------------- */
/* Mutations du panier                                                         */
/* -------------------------------------------------------------------------- */

export function addToCart(config) {
  const product = getProduct(config.productId);
  if (!product) return { ok: false, message: 'Produit introuvable.' };

  const qty = clampQty(config.qty ?? 1);
  const text = typeof config.text === 'string' ? config.text.trim().slice(0, 40) : '';
  const logo = sanitiseLogo(config.logo);
  const color = product.colors.includes(config.color) ? config.color : product.colors[0];
  const size = product.sizes.includes(config.size) ? config.size : product.sizes[0];
  const placement = typeof config.placement === 'string' ? config.placement : 'poitrine';
  const font = typeof config.font === 'string' ? config.font : 'sans';
  const textColor = typeof config.textColor === 'string' ? config.textColor : 'noir';

  const signature = [product.id, color, size, placement, font, textColor, text, logo ? logo.name : ''].join('|');

  const existing = state.cart.find((line) => {
    const lineSignature = [
      line.productId,
      line.color,
      line.size,
      line.placement,
      line.font,
      line.textColor,
      line.text,
      line.logo ? line.logo.name : '',
    ].join('|');
    return lineSignature === signature;
  });

  if (existing) {
    existing.qty = clampQty(existing.qty + qty);
  } else {
    state.cart.push({
      id: uid('ci'),
      productId: product.id,
      qty,
      color,
      size,
      text,
      textColor,
      font,
      placement,
      logo,
      addedAt: new Date().toISOString(),
    });
  }

  persistCart();
  return {
    ok: true,
    message: `${product.name} ajouté au panier.`,
    count: cartCount(),
  };
}

export function updateQty(lineId, qty) {
  const line = state.cart.find((l) => l.id === lineId);
  if (!line) return false;
  line.qty = clampQty(qty);
  persistCart();
  return true;
}

export function removeLine(lineId) {
  const before = state.cart.length;
  state.cart = state.cart.filter((line) => line.id !== lineId);
  if (state.cart.length === before) return false;
  persistCart();
  return true;
}

export function clearCart() {
  state.cart = [];
  persistCart();
}

/* -------------------------------------------------------------------------- */
/* Codes promo                                                                 */
/* -------------------------------------------------------------------------- */

export function getPromo() {
  if (!state.promoCode) return null;
  const def = PROMO_CODES[state.promoCode];
  if (!def) return null;
  return {
    code: state.promoCode,
    rate: def.rate,
    label: def.label,
    min: def.min || 0,
  };
}

export function applyPromo(rawCode) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { ok: false, message: 'Saisissez un code.' };

  const def = PROMO_CODES[code];
  if (!def) return { ok: false, message: 'Ce code n’existe pas.' };

  const subtotal = cartSubtotal();
  if (subtotal <= 0) return { ok: false, message: 'Votre panier est vide.' };
  if (subtotal < (def.min || 0)) {
    return {
      ok: false,
      message: `Ce code s’active à partir de ${formatPrice(def.min)} d’achat.`,
    };
  }

  state.promoCode = code;
  write(STORAGE.promo, code);
  emit();
  return { ok: true, message: `Code ${code} appliqué : −${Math.round(def.rate * 100)} %.` };
}

export function clearPromo() {
  state.promoCode = null;
  write(STORAGE.promo, null);
  emit();
}

/* -------------------------------------------------------------------------- */
/* Totaux                                                                      */
/* -------------------------------------------------------------------------- */

export function getTotals() {
  const subtotal = cartSubtotal();
  const promo = getPromo();
  const discount = promo ? round2(subtotal * promo.rate) : 0;
  return {
    subtotal,
    discount,
    total: round2(Math.max(0, subtotal - discount)),
    promo,
    count: cartCount(),
  };
}

/* -------------------------------------------------------------------------- */
/* Client (pré-remplissage du formulaire)                                      */
/* -------------------------------------------------------------------------- */

const CUSTOMER_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zip', 'note'];

export function getCustomerDraft() {
  return { ...state.customer };
}

export function saveCustomerDraft(values) {
  const draft = {};
  CUSTOMER_FIELDS.forEach((key) => {
    if (typeof values[key] === 'string') draft[key] = values[key].slice(0, 400);
  });
  state.customer = { ...state.customer, ...draft };
  write(STORAGE.customer, state.customer);
}

/* -------------------------------------------------------------------------- */
/* Commandes                                                                   */
/* -------------------------------------------------------------------------- */

function orderNumber(date) {
  const stamp = [
    String(date.getFullYear()).slice(2),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NEY-${stamp}-${rand}`;
}

export function placeOrder({ customer, payment }) {
  const lines = getCartDetailed();
  if (!lines.length) return { ok: false, message: 'Votre panier est vide.' };

  const totals = getTotals();
  const now = new Date();

  const order = {
    id: uid('ord'),
    number: orderNumber(now),
    createdAt: now.toISOString(),
    status: 'En production',
    items: lines.map(({ item, product, unitPrice, lineTotal }) => ({
      productId: product.id,
      name: product.name,
      type: product.type,
      color: item.color,
      size: item.size,
      qty: item.qty,
      text: item.text,
      textColor: item.textColor,
      font: item.font,
      placement: item.placement,
      logoName: item.logo ? item.logo.name : '',
      logo: item.logo ? item.logo.dataUrl : null,
      unitPrice,
      lineTotal,
    })),
    customer: { ...customer },
    payment: { ...payment },
    promo: totals.promo,
    totals: {
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total,
      count: totals.count,
    },
  };

  state.orders.unshift(order);
  const saved = write(STORAGE.orders, state.orders);
  if (!saved) {
    state.orders.shift();
    return {
      ok: false,
      message: 'Enregistrement impossible : le stockage du navigateur est plein.',
    };
  }

  state.cart = [];
  state.promoCode = null;
  write(STORAGE.cart, state.cart);
  write(STORAGE.promo, null);
  saveCustomerDraft(customer);
  emit();

  return { ok: true, order };
}

export function getOrders() {
  return state.orders.map((order) => ({ ...order }));
}

export function getOrder(id) {
  const found = state.orders.find((order) => order.id === id || order.number === id);
  return found ? { ...found } : null;
}

export function clearOrders() {
  state.orders = [];
  write(STORAGE.orders, state.orders);
  emit();
}

export const CART_LIMITS = { maxQty: MAX_QTY };
