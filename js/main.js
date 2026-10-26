/**
 * NEY — Point d'entrée : routeur par hash, en-tête, panier.
 */

import { cartCount, subscribe } from './state.js';
import { toast } from './ui.js';

import * as home from './views/home.js';
import * as catalog from './views/catalog.js';
import * as product from './views/product.js';
import * as cart from './views/cart.js';
import * as checkout from './views/checkout.js';
import * as confirmation from './views/confirmation.js';
import * as orders from './views/orders.js';
import * as personnalisation from './views/personnalisation.js';
import * as contact from './views/contact.js';
import * as notFound from './views/notfound.js';

const ROUTES = [
  { pattern: /^\/$/, view: home },
  { pattern: /^\/boutique\/?$/, view: catalog },
  { pattern: /^\/produit\/([^/]+)\/?$/, view: product, keys: ['id'] },
  { pattern: /^\/panier\/?$/, view: cart },
  { pattern: /^\/commande\/?$/, view: checkout },
  { pattern: /^\/confirmation\/([^/]+)\/?$/, view: confirmation, keys: ['id'] },
  { pattern: /^\/commandes\/?$/, view: orders },
  { pattern: /^\/personnalisation\/?$/, view: personnalisation },
  { pattern: /^\/contact\/?$/, view: contact },
];

const NAV_MATCHERS = [
  { href: '#/', test: (path) => path === '/' },
  { href: '#/boutique', test: (path) => path.startsWith('/boutique') || path.startsWith('/produit') || path.startsWith('/panier') },
  { href: '#/personnalisation', test: (path) => path.startsWith('/personnalisation') },
  {
    href: '#/commandes',
    test: (path) => path.startsWith('/commandes') || path.startsWith('/commande') || path.startsWith('/confirmation'),
  },
  { href: '#/contact', test: (path) => path.startsWith('/contact') },
];

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart = ''] = raw.split('?');
  return {
    path: pathPart || '/',
    search: new URLSearchParams(queryPart),
  };
}

function matchRoute(path) {
  for (const route of ROUTES) {
    const result = route.pattern.exec(path);
    if (result) {
      const params = {};
      (route.keys || []).forEach((key, index) => {
        params[key] = decodeURIComponent(result[index + 1] || '');
      });
      return { view: route.view, params };
    }
  }
  return null;
}

function setMetaDescription(text) {
  const tag = document.querySelector('meta[name="description"]');
  if (tag && text) tag.setAttribute('content', text);
}

function updateNav(path) {
  document.querySelectorAll('#mainNav a').forEach((link) => {
    const matcher = NAV_MATCHERS.find((entry) => entry.href === link.getAttribute('href'));
    const active = matcher ? matcher.test(path) : false;
    link.classList.toggle('is-active', active);
    if (active) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function updateCartBadge() {
  const badge = document.querySelector('[data-cart-count]');
  const link = document.querySelector('.cart-link');
  const count = cartCount();

  if (badge) {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  if (link) {
    link.setAttribute('aria-label', count ? `Panier, ${count} article${count > 1 ? 's' : ''}` : 'Panier, vide');
  }
}

function closeMenu() {
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('menuToggle');
  if (!nav || !toggle) return;
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Ouvrir le menu');
  document.body.classList.remove('no-scroll');
}

function renderRoute({ preserveScroll = false } = {}) {
  const { path, search } = parseHash();
  const matched = matchRoute(path);
  const view = matched ? matched.view : notFound;

  const params = {
    ...(matched ? matched.params : {}),
    get: (key) => search.get(key),
    has: (key) => search.has(key),
  };

  const main = document.getElementById('main');
  if (!main) return;

  const previousScroll = window.scrollY;

  main.innerHTML = view.render(params);

  const meta = view.meta || {};
  document.title = meta.title || 'NEY — Vêtements personnalisés';
  if (meta.description) setMetaDescription(meta.description);

  updateNav(path);

  try {
    if (typeof view.mount === 'function') view.mount(main, params);
  } catch (err) {
    console.error('[NEY] Erreur de rendu :', err);
    toast('Une erreur est survenue sur cette page.', 'error');
  }

  if (preserveScroll) {
    window.scrollTo({ top: previousScroll, behavior: 'auto' });
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  closeMenu();
  updateCartBadge();
}

function initHeader() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');

  toggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.classList.toggle('no-scroll', Boolean(open));
  });

  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initFooter() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const newsletter = document.querySelector('[data-newsletter]');
  newsletter?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = newsletter.querySelector('input[type="email"]');
    const value = input ? input.value.trim() : '';
    const valid = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value);

    if (!valid) {
      toast('Adresse email invalide.', 'error');
      input?.focus();
      return;
    }

    toast('Inscription enregistrée. À très vite dans votre boîte.', 'success');
    newsletter.reset();
  });
}

function init() {
  initHeader();
  initFooter();

  window.addEventListener('hashchange', () => renderRoute());
  window.addEventListener('ney:refresh', () => renderRoute({ preserveScroll: true }));

  subscribe(updateCartBadge);

  if (!window.location.hash) {
    window.history.replaceState(null, '', '#/');
  }

  renderRoute();
}

init();

export { renderRoute };
