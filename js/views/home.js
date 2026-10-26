/**
 * NEY — Vue d'accueil
 */

import { CATEGORIES, COLORS, PRODUCTS, bestSellers, categoryCount } from '../data.js';
import { productGrid, sectionHead } from '../components.js';
import { escapeHtml, formatPrice, icon, svgGarment } from '../ui.js';

function heroHero() {
  const featured = PRODUCTS.find((p) => p.id === 'hoodie-atelier') || PRODUCTS[0];
  const color = COLORS.argile;

  return `<section class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <span class="eyebrow">Atelier de personnalisation — Lyon</span>
        <h1>Portez ce que<br /><em>vous inventez.</em></h1>
        <p class="hero-lead">
          T-shirts, sweats, casquettes et accessoires : choisissez la pièce, la couleur, votre texte
          ou votre logo. Nous la fabriquons à la commande, sans stock, sans intermédiaire.
        </p>
        <div class="hero-actions">
          <a class="btn btn-dark" href="#/boutique">Découvrir la boutique</a>
          <a class="btn btn-outline" href="#/personnalisation">Comment ça marche</a>
        </div>
        <div class="hero-meta">
          <div class="hero-meta-item">
            <strong>${PRODUCTS.length}</strong>
            <span>Pièces à composer</span>
          </div>
          <div class="hero-meta-item">
            <strong>48 h</strong>
            <span>Mise en production</span>
          </div>
          <div class="hero-meta-item">
            <strong>${formatPrice(4.9)}</strong>
            <span>Texte ajouté</span>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        ${svgGarment(featured.type, { color: color.hex, label: featured.name })}
        <div class="hero-tag">
          <strong>${escapeHtml(featured.name)}</strong>
          <span>${escapeHtml(featured.short)}</span>
        </div>
      </div>
    </div>
  </section>`;
}

function trustBar() {
  const items = [
    { icon: 'scissors', title: 'Fabriqué à la commande', text: 'Aucun stock, aucune surproduction' },
    { icon: 'sparkles', title: 'Texte & logo', text: 'Impression et broderie au choix' },
    { icon: 'leaf', title: 'Coton biologique', text: 'Matières certifiées GOTS' },
    { icon: 'shield', title: 'Paiement maîtrisé', text: 'Aucune donnée bancaire stockée' },
  ];

  return `<div class="trust">
    <div class="trust-grid">
      ${items
        .map(
          (item) => `<div class="trust-item">
            ${icon(item.icon)}
            <div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></div>
          </div>`
        )
        .join('')}
    </div>
  </div>`;
}

function categoriesSection() {
  return `<section class="section">
    <div class="container">
      ${sectionHead({
        eyebrow: 'Les familles',
        title: 'Choisissez votre support',
        text: 'Quatre familles de pièces, toutes personnalisables du texte au logo.',
        link: '#/boutique',
        linkLabel: 'Tout le catalogue',
      })}
      <div class="category-grid">
        ${CATEGORIES.map((cat) => {
          const sample = PRODUCTS.find((p) => p.category === cat.id);
          const color = sample ? COLORS[sample.colors[0]] : COLORS.ecru;
          return `<a class="category-card" href="#/boutique?cat=${cat.id}">
            <span class="cat-arrow" aria-hidden="true">↗</span>
            <div class="cat-visual">
              ${svgGarment(cat.type, { color: color.hex, label: cat.label })}
            </div>
            <div class="cat-copy">
              <h3>${escapeHtml(cat.label)}</h3>
              <p>${escapeHtml(cat.copy)} — ${categoryCount(cat.id)} modèles</p>
            </div>
          </a>`;
        }).join('')}
      </div>
    </div>
  </section>`;
}

function bestSellersSection() {
  return `<section class="section tight">
    <div class="container">
      ${sectionHead({
        eyebrow: 'Le plus demandé',
        title: 'Les pièces de l’atelier',
        text: 'Les modèles que l’on personnalise le plus souvent, du basique au hoodie signature.',
        link: '#/boutique?tri=avis',
        linkLabel: 'Voir les mieux notés',
      })}
      ${productGrid(bestSellers(4))}
    </div>
  </section>`;
}

function customBand() {
  const steps = [
    { n: '01', title: 'Choisissez la pièce', text: 'Coton bio, molleton gratté, sergé ou toile.' },
    { n: '02', title: 'Ajoutez votre texte ou logo', text: 'Police, couleur, emplacement : tout se règle en direct.' },
    { n: '03', title: 'Nous fabriquons', text: 'Production lancée sous 48 h, atelier lyonnais.' },
  ];

  return `<section class="section tight">
    <div class="container">
      <div class="custom-band">
        <div>
          <span class="eyebrow">Personnalisation</span>
          <h2>Votre pièce,<br />vos mots.</h2>
          <p>
            Le prix de base couvre la pièce. Ajoutez un texte pour ${formatPrice(4.9)} ou un logo
            pour ${formatPrice(6.9)} — le total se met à jour instantanément, sans surprise au panier.
          </p>
          <a class="btn btn-light" href="#/personnalisation">Voir les techniques</a>
        </div>
        <div class="custom-steps">
          ${steps
            .map(
              (step) => `<div class="custom-step">
                <span class="num">${step.n}</span>
                <div>
                  <strong>${escapeHtml(step.title)}</strong>
                  <small>${escapeHtml(step.text)}</small>
                </div>
              </div>`
            )
            .join('')}
        </div>
      </div>
    </div>
  </section>`;
}

function quotesSection() {
  const quotes = [
    {
      text: '« Trois sweats brodés pour l’équipe, reçus en une semaine. La broderie est nette, le molleton épais. »',
      author: 'Camille R., Lyon',
    },
    {
      text: '« J’ai composé un tote avec le prénom de ma fille. Le rendu à l’écran était fidèle au résultat. »',
      author: 'Sofiane B., Paris',
    },
    {
      text: '« Enfin une boutique qui ne parle pas de stock : on commande, c’est fabriqué, c’est expédié. »',
      author: 'Élodie M., Bordeaux',
    },
  ];

  return `<section class="section tight">
    <div class="container">
      ${sectionHead({
        eyebrow: 'Ils ont composé',
        title: 'Retours d’atelier',
      })}
      <div class="quotes">
        ${quotes
          .map(
            (q) => `<blockquote class="quote">
              <span class="stars" aria-hidden="true">★★★★★</span>
              <p>${escapeHtml(q.text)}</p>
              <footer>${escapeHtml(q.author)}</footer>
            </blockquote>`
          )
          .join('')}
      </div>
    </div>
  </section>`;
}

function closingCta() {
  return `<section class="section tight">
    <div class="container">
      <div class="custom-band" style="grid-template-columns:1fr;text-align:center;justify-items:center;">
        <div>
          <span class="eyebrow" style="justify-content:center;">Prêt à composer</span>
          <h2>La pièce qui manque,<br />c’est celle que vous dessinez.</h2>
          <p style="margin-inline:auto;">
            Parcourez la boutique, ouvrez une fiche produit et personnalisez-la en direct.
            Le panier garde vos choix, même après fermeture du navigateur.
          </p>
          <a class="btn btn-light" href="#/boutique">Commencer une pièce</a>
        </div>
      </div>
    </div>
  </section>`;
}

export function render() {
  return `<div class="view">
    ${heroHero()}
    ${trustBar()}
    ${categoriesSection()}
    ${bestSellersSection()}
    ${customBand()}
    ${quotesSection()}
    ${closingCta()}
  </div>`;
}

export function mount() {
  /* Les cartes produits sont des liens : rien à câbler. */
}

export const meta = {
  title: 'NEY — Vêtements personnalisés',
  description:
    'Composez votre t-shirt, sweat, casquette ou accessoire : couleur, taille, texte et logo. Fabrication à la commande, sans stock.',
};
