/**
 * NEY — Vue panier
 * Modification des quantités, suppression, code promo et total.
 */

import { COLORS, getCategory, getPlacementLabel } from '../data.js';
import { emptyState } from '../components.js';
import {
  applyPromo,
  clearPromo,
  getCartDetailed,
  getTotals,
  removeLine,
  updateQty,
} from '../state.js';
import { escapeHtml, formatPrice, icon, toast } from '../ui.js';

function customSummary(item, product) {
  const bits = [];
  if (item.text) bits.push(`« ${escapeHtml(item.text)} »`);
  if (item.logo) bits.push('logo');
  if (!bits.length) return '';

  const placement = getPlacementLabel(product.type, item.placement);
  return `<div class="cart-custom">
    ${item.logo ? `<img class="mini-logo" src="${item.logo.dataUrl}" alt="" />` : ''}
    <span>${bits.join(' · ')} — ${escapeHtml(placement)}</span>
  </div>`;
}

function cartLine({ item, product, unitPrice, lineTotal }) {
  const category = getCategory(product.category);
  const color = COLORS[item.color] || COLORS.ecru;

  return `<article class="cart-item" data-line="${item.id}">
    <div class="cart-thumb" style="background:${color.hex}22">
      ${svgThumb(product, item.color)}
    </div>

    <div class="cart-item-info">
      <h3><a href="#/produit/${product.id}">${escapeHtml(product.name)}</a></h3>
      <div class="cart-meta">
        <span>Taille <b>${escapeHtml(item.size)}</b></span>
        <span>Couleur <b>${escapeHtml(color.name)}</b></span>
        ${category ? `<span>${escapeHtml(category.label)}</span>` : ''}
        <span>${formatPrice(unitPrice)} / pièce</span>
      </div>
      ${customSummary(item, product)}
    </div>

    <div class="cart-item-actions">
      <span class="line-price">${formatPrice(lineTotal)}</span>
      <div class="qty">
        <button type="button" data-step="-1" aria-label="Diminuer la quantité de ${escapeHtml(product.name)}">−</button>
        <input type="number" min="1" max="20" value="${item.qty}" aria-label="Quantité pour ${escapeHtml(product.name)}" data-qty-input />
        <button type="button" data-step="1" aria-label="Augmenter la quantité de ${escapeHtml(product.name)}">+</button>
      </div>
      <button type="button" class="remove-btn" data-remove>Retirer</button>
    </div>
  </article>`;
}

/* Import différé pour éviter un cycle : le SVG est fourni par ui.js. */
import { svgGarment } from '../ui.js';

function svgThumb(product, colorKey) {
  const color = COLORS[colorKey] || COLORS.ecru;
  return svgGarment(product.type, { color: color.hex, label: product.name, className: 'thumb-garment' });
}

export function render() {
  const lines = getCartDetailed();
  const totals = getTotals();

  if (!lines.length) {
    return `<div class="view">
      <div class="container">
        <div class="page-head">
          <nav class="breadcrumb" aria-label="Fil d’Ariane">
            <a href="#/">Accueil</a><span class="sep">/</span><span>Panier</span>
          </nav>
          <h1>Votre panier</h1>
          <p>Les pièces que vous composez sont conservées dans ce navigateur.</p>
        </div>
        ${emptyState({
          title: 'Le panier est vide',
          text: 'Choisissez une pièce, personnalisez-la, et elle apparaîtra ici — même si vous fermez le navigateur.',
          ctaLabel: 'Parcourir la boutique',
          ctaHref: '#/boutique',
        })}
        <div style="height:60px"></div>
      </div>
    </div>`;
  }

  const promo = totals.promo;

  return `<div class="view">
    <div class="container">
      <div class="page-head">
        <nav class="breadcrumb" aria-label="Fil d’Ariane">
          <a href="#/">Accueil</a><span class="sep">/</span><span>Panier</span>
        </nav>
        <h1>Votre panier</h1>
        <p>${totals.count} ${totals.count > 1 ? 'pièces' : 'pièce'} — vérifiez vos personnalisations avant validation.</p>
      </div>

      <div class="cart-layout">
        <div class="cart-list">
          ${lines.map(cartLine).join('')}
          <p style="font-size:.78rem;color:var(--muted);margin:6px 0 0;">
            ${icon('box')} Aucun stock, aucune livraison à gérer : le total ci-contre correspond
            exactement à vos articles, remise déduite.
          </p>
        </div>

        <aside class="summary" aria-label="Récapitulatif du panier">
          <h2>Récapitulatif</h2>

          <div class="summary-rows">
            <div><span>Sous-total</span><span>${formatPrice(totals.subtotal)}</span></div>
            ${promo ? `<div class="discount"><span>Remise ${escapeHtml(promo.code)} (−${Math.round(promo.rate * 100)} %)</span><span>− ${formatPrice(totals.discount)}</span></div>` : ''}
          </div>

          <div class="summary-total">
            <span>Total</span>
            <strong>${formatPrice(totals.total)}</strong>
          </div>
          <p class="summary-note">Paiement simulé, aucune donnée bancaire stockée.</p>

          <form class="promo-form" id="promoForm" novalidate>
            <label class="sr-only" for="promoInput">Code promotionnel</label>
            <input id="promoInput" type="text" placeholder="Code promo" value="${promo ? escapeHtml(promo.code) : ''}" autocomplete="off" />
            <button class="btn btn-outline btn-sm" type="submit">${promo ? 'Changer' : 'Appliquer'}</button>
          </form>
          <div class="promo-feedback ${promo ? 'ok' : ''}" id="promoFeedback">${
            promo ? `Code ${escapeHtml(promo.code)} actif — ${escapeHtml(promo.label)}.` : 'Essayez NEY10 pour −10 %.'
          }</div>
          ${promo ? `<button type="button" class="btn-ghost" id="removePromo" style="margin-bottom:12px;">Retirer le code</button>` : ''}

          <a class="btn btn-clay btn-block" href="#/commande">Passer commande</a>
          <div class="summary-links">
            <a href="#/boutique" class="text-link">Continuer mes achats</a>
          </div>
        </aside>
      </div>
    </div>
  </div>`;
}

function refresh() {
  window.dispatchEvent(new CustomEvent('ney:refresh'));
}

export function mount(root) {
  root.querySelectorAll('.cart-item').forEach((node) => {
    const lineId = node.dataset.line;

    node.querySelectorAll('[data-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = node.querySelector('[data-qty-input]');
        const current = Number(input?.value) || 1;
        const next = Math.max(1, Math.min(20, current + Number(btn.dataset.step)));
        updateQty(lineId, next);
        refresh();
      });
    });

    node.querySelector('[data-qty-input]')?.addEventListener('change', (event) => {
      const value = Math.max(1, Math.min(20, Number(event.target.value) || 1));
      updateQty(lineId, value);
      refresh();
    });

    node.querySelector('[data-remove]')?.addEventListener('click', () => {
      removeLine(lineId);
      toast('Pièce retirée du panier.', 'info');
      refresh();
    });
  });

  const promoForm = root.querySelector('#promoForm');
  const feedback = root.querySelector('#promoFeedback');

  promoForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = root.querySelector('#promoInput');
    const result = applyPromo(input ? input.value : '');
    if (result.ok) {
      toast(result.message, 'success');
      refresh();
    } else {
      if (feedback) {
        feedback.className = 'promo-feedback ko';
        feedback.textContent = result.message;
      }
      toast(result.message, 'error');
    }
  });

  root.querySelector('#removePromo')?.addEventListener('click', () => {
    clearPromo();
    toast('Code promotionnel retiré.', 'info');
    refresh();
  });
}

export const meta = {
  title: 'Panier — NEY',
  description: 'Votre panier NEY : quantités, codes promo et total, sans frais cachés.',
};
