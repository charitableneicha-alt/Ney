/**
 * NEY — Vue commande (checkout)
 * Coordonnées + moyen de paiement simulé. Pas de livraison, pas de stock.
 */

import { COLORS, PAYMENT_METHODS, getCategory, getPaymentMethod } from '../data.js';
import { emptyState } from '../components.js';
import { getCartDetailed, getCustomerDraft, getTotals, placeOrder } from '../state.js';
import { escapeHtml, formatPrice, icon, svgGarment, toast } from '../ui.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const PHONE_RE = /^[+0-9 ().-]{9,20}$/;

function field({ id, label, type = 'text', value = '', required = false, placeholder = '', span2 = false, hint = '' }) {
  return `<div class="field${span2 ? ' span-2' : ''}" data-field="${id}">
    <label for="${id}">${escapeHtml(label)}${required ? ' *' : ''}</label>
    <input id="${id}" name="${id}" type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(
    placeholder
  )}" ${required ? 'required' : ''} autocomplete="off" />
    ${hint ? `<span class="hint">${escapeHtml(hint)}</span>` : ''}
    <span class="error-msg" data-error></span>
  </div>`;
}

function paymentCards(selected) {
  return PAYMENT_METHODS.map(
    (method) => `<label class="choice-card">
      <input type="radio" name="payment" value="${method.id}"${method.id === selected ? ' checked' : ''} />
      <span class="cc-body">
        <strong>${escapeHtml(method.label)}</strong>
        <small>${escapeHtml(method.detail)}</small>
      </span>
      <span class="cc-price" aria-hidden="true">${icon(method.icon)}</span>
    </label>`
  ).join('');
}

function recapLine({ item, product, lineTotal }) {
  const color = COLORS[item.color] || COLORS.ecru;
  const category = getCategory(product.category);
  return `<div class="recap-item">
    <div class="rt" style="background:${color.hex}22">
      ${svgGarment(product.type, { color: color.hex, label: product.name, className: 'rt-garment' })}
    </div>
    <div>
      <div class="ri-name">${escapeHtml(product.name)}</div>
      <div class="ri-meta">${escapeHtml(item.size)} · ${escapeHtml(color.name)} · ×${item.qty}${
    item.text ? ` · « ${escapeHtml(item.text)} »` : ''
  }${item.logo ? ' · logo' : ''}</div>
      <div class="ri-meta">${category ? escapeHtml(category.label) : ''}</div>
    </div>
    <div class="ri-price">${formatPrice(lineTotal)}</div>
  </div>`;
}

export function render() {
  const lines = getCartDetailed();
  const totals = getTotals();
  const draft = getCustomerDraft();

  if (!lines.length) {
    return `<div class="view"><div class="container">
      <div class="page-head"><h1>Passer commande</h1></div>
      ${emptyState({
        title: 'Votre panier est vide',
        text: 'Ajoutez au moins une pièce personnalisée avant de passer commande.',
        ctaLabel: 'Retour à la boutique',
        ctaHref: '#/boutique',
      })}
      <div style="height:60px"></div>
    </div></div>`;
  }

  return `<div class="view">
    <div class="container">
      <div class="page-head">
        <nav class="breadcrumb" aria-label="Fil d’Ariane">
          <a href="#/">Accueil</a><span class="sep">/</span>
          <a href="#/panier">Panier</a><span class="sep">/</span><span>Commande</span>
        </nav>
        <h1>Finaliser la commande</h1>
        <p>Vos coordonnées suffisent : la pièce part en fabrication, sans stock ni livraison à calculer.</p>
      </div>

      <form class="checkout-layout" id="checkoutForm" novalidate>
        <div>
          <div class="form-card">
            <h2>Vos coordonnées</h2>
            <p class="card-sub">Nous en avons besoin pour vous joindre au sujet de la commande.</p>
            <div class="form-grid">
              ${field({ id: 'firstName', label: 'Prénom', value: draft.firstName || '', required: true, placeholder: 'Camille' })}
              ${field({ id: 'lastName', label: 'Nom', value: draft.lastName || '', required: true, placeholder: 'Renaud' })}
              ${field({ id: 'email', label: 'Email', type: 'email', value: draft.email || '', required: true, placeholder: 'camille@email.fr' })}
              ${field({ id: 'phone', label: 'Téléphone', type: 'tel', value: draft.phone || '', required: true, placeholder: '06 12 34 56 78' })}
              ${field({ id: 'city', label: 'Ville (facultatif)', value: draft.city || '', placeholder: 'Lyon' })}
              ${field({ id: 'zip', label: 'Code postal (facultatif)', value: draft.zip || '', placeholder: '69002' })}
            </div>
            <div class="field span-2">
              <label for="note">Note pour l’atelier (facultatif)</label>
              <textarea id="note" name="note" placeholder="Une précision sur la broderie, une date souhaitée…">${escapeHtml(
                draft.note || ''
              )}</textarea>
              <span class="error-msg" data-error></span>
            </div>
          </div>

          <div class="form-card">
            <h2>Paiement</h2>
            <p class="card-sub">Démonstration : aucun paiement réel n’est effectué.</p>
            <div class="choice-cards" id="paymentCards">${paymentCards('carte')}</div>
          </div>

          <button class="btn btn-clay btn-block" type="submit" id="placeOrderBtn" style="margin-top:18px;">
            Valider la commande · ${formatPrice(totals.total)}
          </button>
          <p class="secure-note">${icon('lock')} Aucune donnée bancaire n’est transmise ni enregistrée.</p>
        </div>

        <aside class="order-recap" aria-label="Récapitulatif de la commande">
          <h2>Votre commande</h2>
          <div class="recap-items">${lines.map(recapLine).join('')}</div>

          <div class="summary-rows">
            <div><span>Sous-total</span><span>${formatPrice(totals.subtotal)}</span></div>
            ${totals.promo ? `<div class="discount"><span>Remise ${escapeHtml(totals.promo.code)}</span><span>− ${formatPrice(totals.discount)}</span></div>` : ''}
          </div>

          <div class="summary-total">
            <span>Total</span>
            <strong>${formatPrice(totals.total)}</strong>
          </div>
          <p class="summary-note">${totals.count} ${totals.count > 1 ? 'pièces' : 'pièce'} · fabrication à la commande · aucun frais de livraison</p>
          <a href="#/panier" class="text-link">Modifier le panier</a>
        </aside>
      </form>
    </div>
  </div>`;
}

function setError(root, fieldName, message) {
  const wrapper = root.querySelector(`[data-field="${fieldName}"]`) || root.querySelector(`#${fieldName}`)?.closest('.field');
  if (!wrapper) return;
  wrapper.classList.toggle('has-error', Boolean(message));
  const target = wrapper.querySelector('[data-error]');
  if (target) target.textContent = message || '';
}

function clearError(root, fieldName) {
  setError(root, fieldName, '');
}

function validate(values) {
  const errors = {};

  if (values.firstName.trim().length < 2) errors.firstName = 'Indiquez votre prénom.';
  if (values.lastName.trim().length < 2) errors.lastName = 'Indiquez votre nom.';
  if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Adresse email invalide.';
  if (!PHONE_RE.test(values.phone.trim())) errors.phone = 'Numéro de téléphone invalide.';

  return errors;
}

export function mount(root) {
  const form = root.querySelector('#checkoutForm');
  if (!form) return;

  const inputs = ['firstName', 'lastName', 'email', 'phone', 'city', 'zip', 'note'];

  inputs.forEach((name) => {
    const input = root.querySelector(`#${name}`);
    input?.addEventListener('input', () => clearError(root, name));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const values = {};
    inputs.forEach((name) => {
      const input = root.querySelector(`#${name}`);
      values[name] = input ? input.value : '';
    });

    const errors = validate(values);
    Object.keys(errors).forEach((key) => setError(root, key, errors[key]));

    const errorKeys = Object.keys(errors);
    if (errorKeys.length) {
      toast('Vérifiez les champs signalés.', 'error');
      const first = root.querySelector(`#${errorKeys[0]}`);
      first?.focus();
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }

    const selectedPayment = root.querySelector('input[name="payment"]:checked');
    const payment = getPaymentMethod(selectedPayment ? selectedPayment.value : 'carte');

    const button = root.querySelector('#placeOrderBtn');
    if (button) {
      button.disabled = true;
      button.textContent = 'Validation…';
    }

    const customer = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      city: values.city.trim(),
      zip: values.zip.trim(),
      note: values.note.trim(),
    };

    const result = placeOrder({ customer, payment: { id: payment.id, label: payment.label } });

    if (!result.ok) {
      toast(result.message, 'error');
      if (button) {
        button.disabled = false;
        button.textContent = 'Valider la commande';
      }
      return;
    }

    toast(`Commande ${result.order.number} enregistrée.`, 'success');
    window.location.hash = `#/confirmation/${result.order.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

export const meta = {
  title: 'Commande — NEY',
  description: 'Finalisez votre commande NEY : coordonnées et paiement simulé, total sans frais cachés.',
};
