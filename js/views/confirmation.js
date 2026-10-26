/**
 * NEY — Vue confirmation de commande
 */

import { COLORS } from '../data.js';
import { getOrder } from '../state.js';
import { escapeHtml, formatDate, formatPrice, icon, svgGarment } from '../ui.js';

export function render(params) {
  const order = getOrder(params.id);

  if (!order) {
    return `<div class="view">
      <div class="confirm">
        <h1>Commande introuvable</h1>
        <p class="lead">Cette commande n’est pas enregistrée dans ce navigateur.</p>
        <div class="confirm-actions">
          <a class="btn btn-dark" href="#/commandes">Voir mes commandes</a>
          <a class="btn btn-outline" href="#/boutique">Retour à la boutique</a>
        </div>
      </div>
    </div>`;
  }

  const itemCount = order.totals ? order.totals.count : order.items.reduce((s, i) => s + i.qty, 0);

  return `<div class="view">
    <div class="confirm">
      <div class="check">${icon('check')}</div>
      <span class="eyebrow" style="justify-content:center;">Commande enregistrée</span>
      <h1>Merci ${escapeHtml(order.customer.firstName || '')} !</h1>
      <p class="lead">
        Votre commande est partie en fabrication. Aucun stock n’était nécessaire : votre pièce
        est produite à la demande, puis mise à disposition selon les modalités convenues par email.
      </p>

      <div class="confirm-card">
        <h2>
          Commande <span class="order-number">${escapeHtml(order.number)}</span>
        </h2>

        <div class="confirm-meta">
          <div>
            <span>Date</span>
            <strong>${escapeHtml(formatDate(order.createdAt))}</strong>
          </div>
          <div>
            <span>Statut</span>
            <strong>${escapeHtml(order.status || 'En production')}</strong>
          </div>
          <div>
            <span>Paiement</span>
            <strong>${escapeHtml(order.payment ? order.payment.label : '—')}</strong>
          </div>
          <div>
            <span>Contact</span>
            <strong>${escapeHtml(order.customer.email || '—')}</strong>
          </div>
        </div>

        <div class="recap-items" style="max-height:none;">
          ${order.items
            .map((item) => {
              const color = COLORS[item.color] || COLORS.ecru;
              return `<div class="recap-item">
                <div class="rt" style="background:${color.hex}22">
                  ${svgGarment(item.type, { color: color.hex, label: item.name, className: 'rt-garment' })}
                </div>
                <div>
                  <div class="ri-name">${escapeHtml(item.name)}</div>
                  <div class="ri-meta">
                    ${escapeHtml(item.size)} · ${escapeHtml(color.name)} · ×${item.qty}
                    ${item.text ? ` · « ${escapeHtml(item.text)} »` : ''}${item.logo ? ' · logo' : ''}
                  </div>
                </div>
                <div class="ri-price">${formatPrice(item.lineTotal)}</div>
              </div>`;
            })
            .join('')}
        </div>

        <div class="summary-rows" style="border-bottom:none;margin-bottom:0;padding-bottom:0;">
          <div><span>Sous-total (${itemCount} ${itemCount > 1 ? 'pièces' : 'pièce'})</span><span>${formatPrice(
    order.totals.subtotal
  )}</span></div>
          ${
            order.promo
              ? `<div class="discount"><span>Remise ${escapeHtml(order.promo.code)}</span><span>− ${formatPrice(
                  order.totals.discount
                )}</span></div>`
              : ''
          }
          <div class="summary-total" style="margin-top:8px;">
            <span>Total payé</span>
            <strong>${formatPrice(order.totals.total)}</strong>
          </div>
        </div>

        ${
          order.customer.note
            ? `<p style="font-size:.8rem;color:var(--muted);margin-top:16px;">
                Note transmise à l’atelier : « ${escapeHtml(order.customer.note)} »
              </p>`
            : ''
        }
      </div>

      <div class="confirm-actions">
        <a class="btn btn-dark" href="#/commandes">Voir mes commandes</a>
        <a class="btn btn-outline" href="#/boutique">Continuer mes achats</a>
        <button type="button" class="btn btn-outline" id="printOrder">Imprimer</button>
      </div>
    </div>
  </div>`;
}

export function mount(root) {
  root.querySelector('#printOrder')?.addEventListener('click', () => {
    window.print();
  });
}

export const meta = {
  title: 'Commande confirmée — NEY',
  description: 'Votre commande NEY est enregistrée et part en fabrication.',
};
