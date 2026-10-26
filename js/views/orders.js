/**
 * NEY — Vue historique des commandes (stockées dans ce navigateur)
 */

import { COLORS } from '../data.js';
import { emptyState } from '../components.js';
import { clearOrders, getOrders } from '../state.js';
import { escapeHtml, formatDate, formatPrice, toast } from '../ui.js';

function orderCard(order) {
  const count = order.totals ? order.totals.count : order.items.reduce((s, i) => s + i.qty, 0);

  return `<article class="order-card">
    <header class="order-head">
      <div>
        <div class="onum">${escapeHtml(order.number)}</div>
        <div class="odate">${escapeHtml(formatDate(order.createdAt))} · ${count} ${
    count > 1 ? 'pièces' : 'pièce'
  }</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="status-pill">${escapeHtml(order.status || 'En production')}</span>
        <strong>${formatPrice(order.totals.total)}</strong>
      </div>
    </header>

    <div class="order-body">
      <div class="order-lines">
        ${order.items
          .map(
            (item) => `<div class="order-line">
              <span class="ol-name">
                <b>${escapeHtml(item.name)}</b> · ${escapeHtml(item.size)} · ${
              escapeHtml((COLORS[item.color] || COLORS.ecru).name)
            } · ×${item.qty}
                ${item.text ? ` · « ${escapeHtml(item.text)} »` : ''}${item.logo ? ' · logo' : ''}
              </span>
              <span>${formatPrice(item.lineTotal)}</span>
            </div>`
          )
          .join('')}
      </div>

      <div class="order-foot">
        <span style="font-size:.8rem;color:var(--muted);">
          ${order.payment ? escapeHtml(order.payment.label) : '—'}
          ${order.promo ? ` · code ${escapeHtml(order.promo.code)} (−${formatPrice(order.totals.discount)})` : ''}
        </span>
        <a class="text-link" href="#/confirmation/${order.id}">Voir le détail</a>
      </div>
    </div>
  </article>`;
}

export function render() {
  const orders = getOrders();

  if (!orders.length) {
    return `<div class="view">
      <div class="container">
        <div class="page-head">
          <nav class="breadcrumb" aria-label="Fil d’Ariane">
            <a href="#/">Accueil</a><span class="sep">/</span><span>Mes commandes</span>
          </nav>
          <h1>Mes commandes</h1>
          <p>L’historique est conservé dans ce navigateur — aucun compte n’est nécessaire.</p>
        </div>
        ${emptyState({
          title: 'Aucune commande pour l’instant',
          text: 'Dès que vous validez une commande, elle apparaît ici avec ses personnalisations et son total.',
          ctaLabel: 'Composer une pièce',
          ctaHref: '#/boutique',
        })}
        <div style="height:60px"></div>
      </div>
    </div>`;
  }

  return `<div class="view">
    <div class="container">
      <div class="page-head">
        <nav class="breadcrumb" aria-label="Fil d’Ariane">
          <a href="#/">Accueil</a><span class="sep">/</span><span>Mes commandes</span>
        </nav>
        <h1>Mes commandes</h1>
        <p>${orders.length} commande${orders.length > 1 ? 's' : ''} enregistrée${
    orders.length > 1 ? 's' : ''
  } dans ce navigateur.</p>
      </div>

      <div class="orders-list">
        ${orders.map(orderCard).join('')}
      </div>

      <p style="font-size:.78rem;color:var(--muted);padding-bottom:60px;">
        <button type="button" class="btn-ghost" id="clearOrders">Effacer l’historique de ce navigateur</button>
      </p>
    </div>
  </div>`;
}

export function mount(root) {
  root.querySelector('#clearOrders')?.addEventListener('click', () => {
    const confirmed = window.confirm('Effacer définitivement l’historique des commandes de ce navigateur ?');
    if (!confirmed) return;
    clearOrders();
    toast('Historique effacé.', 'info');
    window.dispatchEvent(new CustomEvent('ney:refresh'));
  });
}

export const meta = {
  title: 'Mes commandes — NEY',
  description: 'Retrouvez vos commandes NEY enregistrées dans ce navigateur.',
};
