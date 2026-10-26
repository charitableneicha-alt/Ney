/**
 * NEY — Composants d'interface réutilisables.
 */

import { COLORS, getCategory } from './data.js';
import { escapeHtml, formatPrice, svgGarment } from './ui.js';

export function colorDots(colorKeys, max = 4) {
  const keys = colorKeys.slice(0, max);
  return `<div class="color-dots" aria-hidden="true">${keys
    .map((key) => {
      const color = COLORS[key];
      return `<span class="color-dot" style="background:${color ? color.hex : '#ddd'}"></span>`;
    })
    .join('')}</div>`;
}

export function badgeHtml(label, tone = '') {
  if (!label) return '';
  return `<span class="badge${tone ? ` ${tone}` : ''}">${escapeHtml(label)}</span>`;
}

/**
 * Carte produit.
 * @param {object} product
 * @param {{ tone?: string }} options
 */
export function productCard(product, options = {}) {
  const category = getCategory(product.category);
  const mainColor = COLORS[product.colors[0]] || COLORS.ecru;
  const badgeTone = product.badge === 'Nouveau' || product.badge === 'Petit prix' ? 'clay' : '';

  return `<article class="product-card" data-product-card>
    <div class="product-media">
      ${badgeHtml(product.badge, badgeTone)}
      ${svgGarment(product.type, { color: mainColor.hex, label: product.name })}
    </div>
    <div class="product-body">
      <span class="product-cat">${category ? escapeHtml(category.label) : ''}</span>
      <h3 class="product-name"><a href="#/produit/${product.id}">${escapeHtml(product.name)}</a></h3>
      <div class="product-foot">
        <div>
          <span class="price-from">Dès</span>
          <span class="price">${formatPrice(product.price)}</span>
        </div>
        ${colorDots(product.colors)}
      </div>
    </div>
  </article>`;
}

export function productGrid(products, options = {}) {
  if (!products.length) return '';
  const cls = options.three ? 'product-grid three' : 'product-grid';
  return `<div class="${cls}">${products.map((p) => productCard(p, options)).join('')}</div>`;
}

export function sectionHead({ eyebrow, title, text, link, linkLabel }) {
  return `<div class="section-head">
    <div>
      ${eyebrow ? `<span class="eyebrow">${escapeHtml(eyebrow)}</span>` : ''}
      <h2>${title}</h2>
      ${text ? `<p>${escapeHtml(text)}</p>` : ''}
    </div>
    ${link ? `<a class="text-link" href="${link}">${escapeHtml(linkLabel || 'Tout voir')}</a>` : ''}
  </div>`;
}

export function emptyState({ title, text, ctaLabel, ctaHref, icon = 'box' }) {
  return `<div class="empty-state">
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(text)}</p>
    ${ctaLabel && ctaHref ? `<a class="btn btn-dark" href="${ctaHref}">${escapeHtml(ctaLabel)}</a>` : ''}
  </div>`;
}
