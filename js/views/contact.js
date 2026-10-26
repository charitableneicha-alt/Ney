/**
 * NEY — Vue contact
 * Formulaire validé et enregistré localement (aucun serveur d'envoi).
 */

import { BRAND } from '../data.js';
import { escapeHtml, formatDate, icon, toast } from '../ui.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MESSAGES_KEY = 'ney:messages:v1';

function readMessages() {
  try {
    const raw = window.localStorage.getItem(MESSAGES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function pushMessage(entry) {
  try {
    const list = readMessages();
    list.unshift(entry);
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(list.slice(0, 30)));
    return true;
  } catch (err) {
    console.warn('[NEY] Message non enregistré :', err);
    return false;
  }
}

function setError(root, id, message) {
  const wrapper = root.querySelector(`[data-field="${id}"]`);
  if (!wrapper) return;
  wrapper.classList.toggle('has-error', Boolean(message));
  const slot = wrapper.querySelector('[data-error]');
  if (slot) slot.textContent = message || '';
}

const SUBJECTS = [
  'Une question sur une pièce',
  'Un projet sur mesure',
  'Suivi d’une commande',
  'Retrait à l’atelier',
  'Autre demande',
];

export function render() {
  const messages = readMessages();

  return `<div class="view">
    <div class="container">
      <div class="page-head">
        <nav class="breadcrumb" aria-label="Fil d’Ariane">
          <a href="#/">Accueil</a><span class="sep">/</span><span>Contact</span>
        </nav>
        <h1>Parlons de votre projet</h1>
        <p>Une équipe de trois personnes, à Lyon. Nous répondons sous un jour ouvré.</p>
      </div>

      <div class="contact-grid">
        <div>
          <div class="contact-list">
            <div class="contact-item">
              ${icon('mail')}
              <div>
                <strong>Email</strong>
                <a href="mailto:${escapeHtml(BRAND.email)}">${escapeHtml(BRAND.email)}</a>
              </div>
            </div>
            <div class="contact-item">
              ${icon('phone')}
              <div>
                <strong>Téléphone</strong>
                <a href="tel:${escapeHtml(BRAND.phone.replace(/\s/g, ''))}">${escapeHtml(BRAND.phone)}</a>
              </div>
            </div>
            <div class="contact-item">
              ${icon('pin')}
              <div>
                <strong>Atelier</strong>
                <span>${escapeHtml(BRAND.address)}</span>
              </div>
            </div>
            <div class="contact-item">
              ${icon('clock')}
              <div>
                <strong>Horaires</strong>
                <span>${escapeHtml(BRAND.hours)}</span>
              </div>
            </div>
          </div>

          <div class="info-card" style="margin-top:24px;">
            <h3>Le saviez-vous ?</h3>
            <p style="font-size:.85rem;color:var(--muted);margin:0;">
              Nous ne gérons ni stock ni livraison : chaque commande est fabriquée à la demande.
              Pour un projet d’équipe (10 pièces ou plus), écrivez-nous directement, nous ajustons
              les délais et le devis.
            </p>
          </div>

          ${
            messages.length
              ? `<div class="info-card" style="margin-top:18px;">
                  <h3>Messages envoyés depuis ce navigateur</h3>
                  <ul>
                    ${messages
                      .slice(0, 3)
                      .map(
                        (msg) => `<li>
                          <span>${escapeHtml(msg.subject || 'Message')}<br /><small style="color:var(--muted);font-size:.72rem;">${escapeHtml(
                          formatDate(msg.at)
                        )}</small></span>
                          <b style="font-size:.74rem;color:var(--muted);">Enregistré</b>
                        </li>`
                      )
                      .join('')}
                  </ul>
                </div>`
              : ''
          }
        </div>

        <form class="form-card" id="contactForm" novalidate>
          <h2>Écrire à l’atelier</h2>
          <p class="card-sub">Les champs marqués d’un * sont nécessaires pour vous répondre.</p>

          <div class="form-grid">
            <div class="field" data-field="cname">
              <label for="cname">Nom *</label>
              <input id="cname" name="cname" type="text" autocomplete="name" placeholder="Camille Renaud" />
              <span class="error-msg" data-error></span>
            </div>
            <div class="field" data-field="cemail">
              <label for="cemail">Email *</label>
              <input id="cemail" name="cemail" type="email" autocomplete="email" placeholder="camille@email.fr" />
              <span class="error-msg" data-error></span>
            </div>
            <div class="field span-2" data-field="csubject">
              <label for="csubject">Sujet</label>
              <select id="csubject">
                ${SUBJECTS.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="field" data-field="cmessage">
            <label for="cmessage">Message *</label>
            <textarea id="cmessage" name="cmessage" placeholder="Décrivez votre projet, la pièce souhaitée, les quantités…"></textarea>
            <span class="error-msg" data-error></span>
          </div>

          <button class="btn btn-clay btn-block" type="submit">Envoyer le message</button>
          <p class="secure-note">${icon('lock')} Démonstration : le message reste dans ce navigateur.</p>
        </form>
      </div>
    </div>
  </div>`;
}

export function mount(root) {
  const form = root.querySelector('#contactForm');
  if (!form) return;

  const name = root.querySelector('#cname');
  const email = root.querySelector('#cemail');
  const subject = root.querySelector('#csubject');
  const message = root.querySelector('#cmessage');

  [name, email, message].forEach((input) => {
    input?.addEventListener('input', () => {
      const id = input.id;
      const map = { cname: 'cname', cemail: 'cemail', cmessage: 'cmessage' };
      setError(root, map[id] || id, '');
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const errors = {};
    if (!name || name.value.trim().length < 2) errors.cname = 'Indiquez votre nom.';
    if (!email || !EMAIL_RE.test(email.value.trim())) errors.cemail = 'Adresse email invalide.';
    if (!message || message.value.trim().length < 10) errors.cmessage = 'Votre message est un peu court.';

    setError(root, 'cname', errors.cname);
    setError(root, 'cemail', errors.cemail);
    setError(root, 'cmessage', errors.cmessage);

    const keys = Object.keys(errors);
    if (keys.length) {
      toast('Vérifiez les champs signalés.', 'error');
      root.querySelector(`#${keys[0]}`)?.focus();
      return;
    }

    const saved = pushMessage({
      name: name.value.trim(),
      email: email.value.trim(),
      subject: subject ? subject.value : 'Message',
      message: message.value.trim(),
      at: new Date().toISOString(),
    });

    form.reset();
    toast(
      saved ? 'Message enregistré. L’atelier vous répond par email.' : 'Message envoyé, mais non conservé localement.',
      saved ? 'success' : 'info'
    );

    window.setTimeout(() => window.dispatchEvent(new CustomEvent('ney:refresh')), 400);
  });
}

export const meta = {
  title: 'Contact — NEY',
  description: 'Contactez l’atelier NEY à Lyon : email, téléphone, adresse et horaires.',
};
