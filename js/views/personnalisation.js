/**
 * NEY — Vue « Personnalisation » : techniques, tarifs et questions fréquentes.
 */

import { COLORS, CUSTOM_PRICES, MAX_TEXT_LENGTH } from '../data.js';
import { sectionHead } from '../components.js';
import { escapeHtml, formatPrice, icon, svgGarment } from '../ui.js';

const STEPS = [
  {
    title: 'Choisissez la pièce et la couleur',
    text: 'T-shirts, sweats, hoodies, casquettes, accessoires : chaque modèle existe en plusieurs teintes de stock permanent — puisque rien n’est stocké, tout est toujours disponible.',
  },
  {
    title: 'Ajoutez votre texte',
    text: `Jusqu’à ${MAX_TEXT_LENGTH} caractères, dans la police et la couleur de votre choix. Le texte est gravé à l’identique de l’aperçu, majuscules comprises.`,
  },
  {
    title: 'Importez votre logo',
    text: 'PNG, JPG, WEBP ou SVG. Un fichier de 1500 px minimum garantit une impression nette. Vous pouvez combiner texte et logo sur la même pièce.',
  },
  {
    title: 'Choisissez l’emplacement',
    text: 'Poitrine, dos ou manche selon la pièce. L’aperçu se replace automatiquement pour vous montrer le rendu.',
  },
  {
    title: 'Validez : nous fabriquons',
    text: 'Aucun stock, aucune attente de réassort : votre commande déclenche la production dans notre atelier lyonnais sous 48 h ouvrées.',
  },
];

const TECHNIQUES = [
  {
    icon: 'sparkles',
    title: 'Impression textile',
    text: 'Encre à l’eau, rendu souple et mat. Idéale pour les textes fins et les logos détaillés.',
  },
  {
    icon: 'scissors',
    title: 'Broderie',
    text: 'Fil de coton, relief net. Parfaite pour les casquettes, les sweats et les monogrammes.',
  },
  {
    icon: 'leaf',
    title: 'Matières responsables',
    text: 'Coton biologique certifié, polyester recyclé sur les molletons. Encres sans solvant.',
  },
];

const FAQ = [
  {
    q: 'Y a-t-il un stock limité ?',
    a: 'Non. Nous ne gérons pas de stock : chaque commande lance la fabrication de la pièce. Si un modèle est affiché, il est disponible.',
  },
  {
    q: 'Comment se passe la remise de la commande ?',
    a: 'Aucune livraison n’est gérée par la boutique. La commande est enregistrée avec vos coordonnées et l’atelier vous contacte par email pour convenir de la remise.',
  },
  {
    q: 'Le prix change-t-il selon la quantité ?',
    a: 'Le prix de la pièce est unitaire. Le texte ajoute ' + formatPrice(CUSTOM_PRICES.text) + ' et le logo ' + formatPrice(CUSTOM_PRICES.logo) + ', quel que soit le nombre de pièces.',
  },
  {
    q: 'Puis-je annuler ou modifier une commande ?',
    a: 'Tant que la fabrication n’a pas démarré, écrivez-nous : nous ajustons la commande. Une fois la production lancée, la personnalisation est définitive.',
  },
  {
    q: 'Les couleurs à l’écran sont-elles fidèles ?',
    a: 'L’aperçu utilise les références Pantone de nos textiles. Un léger écart est possible selon l’écran ; nous vous conseillons de vérifier sur un écran calibré pour les projets professionnels.',
  },
];

export function render() {
  const swimsuitColor = COLORS.argile;

  return `<div class="view">
    <div class="container">
      <div class="page-head">
        <nav class="breadcrumb" aria-label="Fil d’Ariane">
          <a href="#/">Accueil</a><span class="sep">/</span><span>Personnalisation</span>
        </nav>
        <h1>Comment ça marche</h1>
        <p>
          Un atelier, pas un entrepôt. Vous composez, nous fabriquons — sans stock intermédiaire,
          et sans frais de livraison à calculer.
        </p>
      </div>

      <section class="section tight">
        <div class="split">
          <div class="visual-block">
            ${svgGarment('hoodie', { color: swimsuitColor.hex, label: 'Hoodie personnalisé' })}
          </div>
          <div>
            <span class="eyebrow">Le principe</span>
            <h2>Cinq étapes, zéro stock</h2>
            <p style="color:var(--muted);">
              Tout se passe dans votre navigateur : l’aperçu, le prix et le panier se mettent à jour
              en direct. Ce que vous voyez est ce que nous imprimons.
            </p>
            <div class="steps">
              ${STEPS.map(
                (step, index) => `<div class="step">
                  <span class="step-num">${String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>${escapeHtml(step.title)}</h3>
                    <p>${escapeHtml(step.text)}</p>
                  </div>
                </div>`
              ).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="section tight">
        ${sectionHead({
          eyebrow: 'Savoir-faire',
          title: 'Trois techniques, un seul atelier',
          text: 'Nous choisissons la technique selon la matière, le motif et l’emplacement.',
        })}
        <div class="product-grid three">
          ${TECHNIQUES.map(
            (item) => `<article class="info-card">
              <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
                <span style="color:var(--clay);display:inline-flex;">${icon(item.icon)}</span>
                <h3 style="margin:0;">${escapeHtml(item.title)}</h3>
              </div>
              <p style="font-size:.85rem;color:var(--muted);margin:0;">${escapeHtml(item.text)}</p>
            </article>`
          ).join('')}
        </div>
      </section>

      <section class="section tight">
        <div class="split" style="align-items:start;">
          <div>
            ${sectionHead({ eyebrow: 'Tarifs', title: 'Des prix lisibles' })}
            <div class="info-card">
              <ul>
                <li><span>Prix de la pièce</span><b>Selon le modèle</b></li>
                <li><span>Ajout d’un texte</span><b>${formatPrice(CUSTOM_PRICES.text)}</b></li>
                <li><span>Ajout d’un logo</span><b>${formatPrice(CUSTOM_PRICES.logo)}</b></li>
                <li><span>Supprimer une personnalisation</span><b>Gratuit</b></li>
                <li><span>Frais de livraison</span><b>Non applicables</b></li>
              </ul>
              <p style="font-size:.78rem;color:var(--muted);margin:14px 0 0;">
                Le total du panier correspond exactement à la somme des pièces, moins la remise
                éventuelle. Aucun frais n’est ajouté à l’étape suivante.
              </p>
            </div>
          </div>

          <div>
            ${sectionHead({ eyebrow: 'Questions', title: 'On vous répond' })}
            <div class="accordion" style="margin-top:0;">
              ${FAQ.map(
                (item, index) => `<details${index === 0 ? ' open' : ''}>
                  <summary>${escapeHtml(item.q)}</summary>
                  <div class="acc-body"><p>${escapeHtml(item.a)}</p></div>
                </details>`
              ).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="section tight" style="padding-bottom:70px;">
        <div class="custom-band" style="grid-template-columns:1fr;text-align:center;justify-items:center;">
          <div>
            <span class="eyebrow" style="justify-content:center;">À vous</span>
            <h2>Une idée en tête ?</h2>
            <p style="margin-inline:auto;">
              Ouvrez une fiche produit, saisissez votre texte et voyez le rendu immédiatement.
            </p>
            <a class="btn btn-light" href="#/boutique">Composer ma pièce</a>
          </div>
        </div>
      </section>
    </div>
  </div>`;
}

export function mount() {}

export const meta = {
  title: 'Personnalisation — NEY',
  description:
    'Comment personnaliser une pièce NEY : texte, logo, emplacement, techniques d’impression et de broderie, tarifs et délais.',
};
