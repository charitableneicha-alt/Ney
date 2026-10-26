/**
 * NEY — Vue catalogue
 * Filtres par famille, recherche et tri, entièrement côté client.
 */

import { CATEGORIES, PRODUCTS, categoryCount, getCategory } from '../data.js';
import { emptyState, productCard } from '../components.js';
import { debounce, escapeHtml, icon } from '../ui.js';

const SORTS = [
  { id: 'pertinence', label: 'Pertinence' },
  { id: 'prix-asc', label: 'Prix croissant' },
  { id: 'prix-desc', label: 'Prix décroissant' },
  { id: 'avis', label: 'Mieux notés' },
  { id: 'nouveau', label: 'Nouveautés' },
];

function readFilters(params) {
  const cat = params.get('cat') || '';
  const known = CATEGORIES.some((c) => c.id === cat);
  return {
    cat: known ? cat : '',
    q: (params.get('q') || '').slice(0, 60),
    sort: SORTS.some((s) => s.id === params.get('tri')) ? params.get('tri') : 'pertinence',
  };
}

function filterProducts(filters) {
  let list = PRODUCTS.slice();

  if (filters.cat) {
    list = list.filter((p) => p.category === filters.cat);
  }

  const query = filters.q.trim().toLowerCase();
  if (query) {
    list = list.filter((p) => {
      const cat = getCategory(p.category);
      const haystack = [p.name, p.short, p.description, cat ? cat.label : ''].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }

  switch (filters.sort) {
    case 'prix-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'prix-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'avis':
      list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      break;
    case 'nouveau':
      list.sort((a, b) => Number(Boolean(b.badge === 'Nouveau')) - Number(Boolean(a.badge === 'Nouveau')));
      break;
    default:
      break;
  }

  return list;
}

function categoryFilters() {
  const all = `<button type="button" data-cat="" class="is-active">
      Toutes les pièces <span class="count">${PRODUCTS.length}</span>
    </button>`;

  return (
    all +
    CATEGORIES.map(
      (cat) => `<button type="button" data-cat="${cat.id}">
        ${escapeHtml(cat.label)} <span class="count">${categoryCount(cat.id)}</span>
      </button>`
    ).join('')
  );
}

function sortOptions(selected) {
  return SORTS.map(
    (sort) => `<option value="${sort.id}"${sort.id === selected ? ' selected' : ''}>${escapeHtml(sort.label)}</option>`
  ).join('');
}

export function render(params) {
  const filters = readFilters(params);
  const cat = filters.cat ? getCategory(filters.cat) : null;
  const title = cat ? cat.label : 'Toute la boutique';
  const intro = cat
    ? `${cat.copy}. Chaque pièce est personnalisable : texte, logo, couleur et emplacement.`
    : 'Toutes nos pièces, fabriquées à la commande. Aucun stock : si c’est affiché, c’est disponible.';

  return `<div class="view">
    <div class="container">
      <div class="page-head">
        <nav class="breadcrumb" aria-label="Fil d’Ariane">
          <a href="#/">Accueil</a>
          <span class="sep">/</span>
          <a href="#/boutique">Boutique</a>
          ${cat ? `<span class="sep">/</span><span>${escapeHtml(cat.label)}</span>` : ''}
        </nav>
        <h1 id="catalogTitle">${escapeHtml(title)}</h1>
        <p id="catalogIntro">${escapeHtml(intro)}</p>
      </div>

      <div class="catalog-layout">
        <aside class="filters" aria-label="Filtres">
          <div class="filter-block search-field">
            <label class="sr-only" for="catalogSearch">Rechercher une pièce</label>
            ${icon('search')}
            <input id="catalogSearch" type="search" placeholder="Rechercher…" value="${escapeHtml(filters.q)}" autocomplete="off" />
          </div>

          <div class="filter-block">
            <h4>Familles</h4>
            <div class="filter-list" id="catalogCats">${categoryFilters()}</div>
          </div>

          <div class="filter-block">
            <h4>Bon à savoir</h4>
            <p style="font-size:.76rem;color:var(--muted);margin:0;">
              Aucune gestion de stock : chaque commande lance la fabrication de la pièce.
              Le prix affiché est celui de la pièce nue.
            </p>
          </div>
        </aside>

        <div>
          <div class="catalog-toolbar">
            <p class="result-count" id="catalogCount" aria-live="polite"></p>
            <label class="select-field">
              Trier par
              <select id="catalogSort">${sortOptions(filters.sort)}</select>
            </label>
          </div>
          <div class="chips" id="catalogChips"></div>
          <div id="catalogGrid"></div>
        </div>
      </div>
    </div>
  </div>`;
}

export function mount(root, params) {
  const filters = readFilters(params);

  const searchInput = root.querySelector('#catalogSearch');
  const grid = root.querySelector('#catalogGrid');
  const count = root.querySelector('#catalogCount');
  const chips = root.querySelector('#catalogChips');
  const sortSelect = root.querySelector('#catalogSort');
  const catButtons = Array.from(root.querySelectorAll('#catalogCats button'));
  const titleEl = root.querySelector('#catalogTitle');
  const introEl = root.querySelector('#catalogIntro');

  if (!grid || !count) return;

  const syncHash = () => {
    const query = new URLSearchParams();
    if (filters.cat) query.set('cat', filters.cat);
    if (filters.q) query.set('q', filters.q);
    if (filters.sort !== 'pertinence') query.set('tri', filters.sort);
    const suffix = query.toString();
    const nextHash = `#/boutique${suffix ? `?${suffix}` : ''}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
  };

  const paint = () => {
    const list = filterProducts(filters);

    catButtons.forEach((btn) => {
      btn.classList.toggle('is-active', (btn.dataset.cat || '') === filters.cat);
    });

    const cat = filters.cat ? getCategory(filters.cat) : null;
    if (titleEl) {
      titleEl.textContent = cat ? cat.label : 'Toute la boutique';
    }
    if (introEl) {
      introEl.textContent = cat
        ? `${cat.copy}. Chaque pièce est personnalisable : texte, logo, couleur et emplacement.`
        : 'Toutes nos pièces, fabriquées à la commande. Aucun stock : si c’est affiché, c’est disponible.';
    }

    count.innerHTML = `<strong>${list.length}</strong> ${list.length > 1 ? 'pièces' : 'pièce'}${
      filters.q ? ` pour « ${escapeHtml(filters.q)} »` : ''
    }`;

    const activeChips = [];
    if (filters.cat && cat) {
      activeChips.push(`<span class="chip">${escapeHtml(cat.label)}<button type="button" data-clear="cat" aria-label="Retirer le filtre famille">×</button></span>`);
    }
    if (filters.q) {
      activeChips.push(`<span class="chip">« ${escapeHtml(filters.q)} »<button type="button" data-clear="q" aria-label="Retirer la recherche">×</button></span>`);
    }
    chips.innerHTML = activeChips.join('');

    if (!list.length) {
      grid.innerHTML = emptyState({
        title: 'Aucune pièce ne correspond',
        text: 'Essayez un autre mot-clé ou revenez à toutes les familles : tout le catalogue est toujours disponible.',
        ctaLabel: 'Réinitialiser les filtres',
        ctaHref: '#/boutique',
      });
      grid.querySelector('.empty-state a')?.addEventListener('click', (event) => {
        event.preventDefault();
        filters.cat = '';
        filters.q = '';
        filters.sort = 'pertinence';
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'pertinence';
        syncHash();
        paint();
      });
      return;
    }

    grid.innerHTML = `<div class="product-grid">${list.map((p) => productCard(p)).join('')}</div>`;
  };

  const onSearch = debounce(() => {
    filters.q = searchInput ? searchInput.value.trim().slice(0, 60) : '';
    syncHash();
    paint();
  }, 220);

  searchInput?.addEventListener('input', onSearch);

  sortSelect?.addEventListener('change', () => {
    filters.sort = sortSelect.value;
    syncHash();
    paint();
  });

  catButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filters.cat = btn.dataset.cat || '';
      syncHash();
      paint();
    });
  });

  chips.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-clear]');
    if (!btn) return;
    const key = btn.dataset.clear;
    if (key === 'cat') filters.cat = '';
    if (key === 'q') {
      filters.q = '';
      if (searchInput) searchInput.value = '';
    }
    syncHash();
    paint();
  });

  paint();
}

export const meta = {
  title: 'Boutique — NEY',
  description:
    'T-shirts, sweats, hoodies, casquettes et accessoires personnalisables. Filtrez par famille, recherchez et triez les pièces NEY.',
};
