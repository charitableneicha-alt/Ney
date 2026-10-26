/**
 * NEY — Vue fiche produit + configurateur de personnalisation
 * L'aperçu, le prix et le récapitulatif se mettent à jour en direct.
 */

import {
  COLORS,
  CUSTOM_PRICES,
  FONTS,
  MAX_TEXT_LENGTH,
  getCategory,
  getFont,
  getPlacementLabel,
  getPlacements,
  getProduct,
  relatedProducts,
} from '../data.js';
import { productGrid, sectionHead } from '../components.js';
import { addToCart, unitPriceFor } from '../state.js';
import { escapeHtml, formatPrice, icon, isLight, starsHtml, svgGarment, toast } from '../ui.js';

const PRINT_GEOMETRY = {
  tshirt: { top: 33, width: 30 },
  sweat: { top: 31, width: 30 },
  hoodie: { top: 36, width: 27 },
  cap: { top: 44, width: 25 },
  tote: { top: 48, width: 34 },
  mug: { top: 50, width: 27 },
};

const TEXT_COLOR_KEYS = ['noir', 'ecru', 'argile', 'olive', 'marine', 'moutarde'];

function printGeometry(type, placement) {
  const base = PRINT_GEOMETRY[type] || PRINT_GEOMETRY.tshirt;
  if (placement === 'dos') return { top: base.top + 7, width: base.width + 8, left: 50 };
  if (placement === 'manche') return { top: base.top + 8, width: 13, left: 77 };
  return { top: base.top, width: base.width, left: 50 };
}

function swatches(product, selected) {
  return product.colors
    .map((key) => {
      const color = COLORS[key];
      return `<button type="button" class="swatch" data-color="${key}" aria-pressed="${
        key === selected ? 'true' : 'false'
      }" aria-label="${escapeHtml(color.name)}" style="--swatch:${color.hex}"><i></i></button>`;
    })
    .join('');
}

function sizeButtons(product, selected) {
  return product.sizes
    .map(
      (size) => `<button type="button" class="size-btn" data-size="${escapeHtml(size)}" aria-pressed="${
        size === selected ? 'true' : 'false'
      }">${escapeHtml(size)}</button>`
    )
    .join('');
}

function textColorSwatches(selected) {
  return TEXT_COLOR_KEYS.map((key) => {
    const color = COLORS[key];
    return `<button type="button" data-textcolor="${key}" aria-pressed="${
      key === selected ? 'true' : 'false'
    }" aria-label="${escapeHtml(color.name)}" style="--swatch:${color.hex}"></button>`;
  }).join('');
}

function placementOptions(type, selected) {
  return getPlacements(type)
    .map((p) => `<option value="${p.id}"${p.id === selected ? ' selected' : ''}>${escapeHtml(p.label)}</option>`)
    .join('');
}

function fontOptions(selected) {
  return FONTS.map(
    (font) => `<option value="${font.id}"${font.id === selected ? ' selected' : ''}>${escapeHtml(font.label)}</option>`
  ).join('');
}

export function render(params) {
  const product = getProduct(params.id);
  if (!product) {
    return `<div class="view"><div class="container section">
      <h1>Pièce introuvable</h1>
      <p>Cette référence n’existe pas ou plus.</p>
      <a class="btn btn-dark" href="#/boutique">Retour à la boutique</a>
    </div></div>`;
  }

  const category = getCategory(product.category);
  const defaultColor = product.colors[0];
  const placements = getPlacements(product.type);
  const defaultPlacement = placements[0].id;
  const related = relatedProducts(product, 4);
  const geo = printGeometry(product.type, defaultPlacement);
  const apparel = product.type === 'tshirt' || product.type === 'sweat' || product.type === 'hoodie';
  const fitLabel = apparel
    ? `Coupe ${product.fit || 'unisexe'}`
    : `${product.type === 'mug' ? 'Format' : 'Taille'} ${product.fit || 'unique'}`;

  return `<div class="view" data-product-view data-product-id="${product.id}">
    <div class="container">
      <nav class="breadcrumb" aria-label="Fil d’Ariane" style="padding-top:26px;">
        <a href="#/">Accueil</a>
        <span class="sep">/</span>
        <a href="#/boutique">Boutique</a>
        <span class="sep">/</span>
        <a href="#/boutique?cat=${product.category}">${escapeHtml(category ? category.label : '')}</a>
        <span class="sep">/</span>
        <span>${escapeHtml(product.name)}</span>
      </nav>

      <div class="product-layout">
        <div class="preview-column">
          <div class="preview-shell tone-${product.tone}" id="previewShell">
            <div id="previewGarment" style="width:100%;display:grid;place-items:center;">
              ${svgGarment(product.type, { color: COLORS[defaultColor].hex, label: product.name })}
            </div>
            <div class="print-area" id="printArea" data-placement="${defaultPlacement}"
                 style="top:${geo.top}%;left:${geo.left}%;width:${geo.width}%;"></div>
          </div>
          <div class="preview-caption">
            <span class="swatch-name">
              <i id="previewSwatch" style="background:${COLORS[defaultColor].hex}"></i>
              <span id="previewColorName">${escapeHtml(COLORS[defaultColor].name)}</span>
            </span>
            <span id="previewPlacement">${escapeHtml(getPlacementLabel(product.type, defaultPlacement))}</span>
          </div>
        </div>

        <div class="product-info">
          <span class="eyebrow">${escapeHtml(category ? category.label : '')}</span>
          <h1>${escapeHtml(product.name)}</h1>
          <div class="product-rating">
            ${starsHtml(product.rating)}
            <span>${product.rating.toFixed(1)} · ${product.reviews} avis</span>
          </div>

          <div class="product-price">
            <span class="price" id="unitPriceLabel">${formatPrice(product.price)}</span>
            <span class="price-note">pièce nue · personnalisation en option</span>
          </div>

          <p class="product-desc">${escapeHtml(product.short)}</p>

          <div class="option-group">
            <div class="option-head">
              <span class="option-label">Couleur <strong id="colorLabel">${escapeHtml(COLORS[defaultColor].name)}</strong></span>
            </div>
            <div class="swatches" id="colorSwatches">${swatches(product, defaultColor)}</div>
          </div>

          <div class="option-group">
            <div class="option-head">
              <span class="option-label">Taille <strong id="sizeLabel">${escapeHtml(product.sizes[0])}</strong></span>
              <span class="option-value">Coupe ${escapeHtml(product.fit || 'unisexe')}</span>
            </div>
            <div class="size-options" id="sizeOptions">${sizeButtons(product, product.sizes[0])}</div>
          </div>

          <div class="personalizer">
            <div class="personalizer-head">
              <h3>Personnalisez</h3>
              <span class="tag">Option</span>
            </div>
            <p>Texte ${formatPrice(CUSTOM_PRICES.text)} · Logo ${formatPrice(CUSTOM_PRICES.logo)} — ajoutés au prix de la pièce.</p>

            <div class="field">
              <label for="customText">Votre texte</label>
              <input id="customText" type="text" maxlength="${MAX_TEXT_LENGTH}" placeholder="Ex. ATELIER NEY" autocomplete="off" />
              <span class="hint"><span id="textCount">0</span>/${MAX_TEXT_LENGTH} caractères</span>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="customFont">Police</label>
                <select id="customFont">${fontOptions('sans')}</select>
              </div>
              <div class="field">
                <label for="customPlacement">Emplacement</label>
                <select id="customPlacement">${placementOptions(product.type, defaultPlacement)}</select>
              </div>
            </div>

            <div class="field">
              <span class="field-label">Couleur du texte</span>
              <div class="color-swatches-sm" id="textColors">${textColorSwatches('noir')}</div>
            </div>

            <div class="field">
              <span class="field-label">Votre logo</span>
              <div class="upload-box">
                <input type="file" id="logoInput" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
                <label class="upload-trigger" for="logoInput">
                  <strong>Choisir un fichier</strong>
                  <small>PNG, JPG, WEBP ou SVG — 500 Ko max</small>
                </label>
                <div id="logoPreview" hidden></div>
              </div>
            </div>
          </div>

          <div class="price-breakdown" id="priceBreakdown"></div>

          <div class="product-buy">
            <div class="qty">
              <button type="button" data-qty="-1" aria-label="Diminuer la quantité">−</button>
              <input id="qtyInput" type="number" min="1" max="20" value="1" aria-label="Quantité" />
              <button type="button" data-qty="1" aria-label="Augmenter la quantité">+</button>
            </div>
            <button type="button" class="btn btn-clay" id="addToCart">Ajouter au panier</button>
          </div>

          <div class="product-notes">
            <div>${icon('box')}<span>Aucun stock : votre pièce entre en fabrication dès la commande.</span></div>
            <div>${icon('scissors')}<span>Impression ou broderie réalisée dans notre atelier lyonnais.</span></div>
            <div>${icon('shield')}<span>Paiement simulé — aucune donnée bancaire n’est transmise ni stockée.</span></div>
          </div>

          <div class="accordion">
            <details open>
              <summary>Description</summary>
              <div class="acc-body"><p>${escapeHtml(product.description)}</p></div>
            </details>
            <details>
              <summary>Matière &amp; entretien</summary>
              <div class="acc-body">
                <ul style="display:grid;gap:6px;">
                  ${product.details.map((d) => `<li>— ${escapeHtml(d)}</li>`).join('')}
                </ul>
              </div>
            </details>
            <details>
              <summary>Personnalisation &amp; délais</summary>
              <div class="acc-body">
                <p>Texte : ${formatPrice(CUSTOM_PRICES.text)} — jusqu’à ${MAX_TEXT_LENGTH} caractères, majuscules appliquées à l’impression.</p>
                <p>Logo : ${formatPrice(CUSTOM_PRICES.logo)} — fichier PNG/JPG/WEBP/SVG, idéalement 1500 px minimum.</p>
                <p>Mise en production sous 48 h ouvrées, réalisation 3 à 5 jours.</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      <section class="section tight">
        ${sectionHead({
          eyebrow: 'À compléter',
          title: 'Composez aussi',
          text: 'D’autres supports pour la même idée.',
        })}
        ${productGrid(related)}
      </section>
    </div>
  </div>`;
}

export function mount(root, params) {
  const product = getProduct(params.id);
  if (!product) return;

  document.title = `${product.name} — NEY`;

  const cfg = {
    color: product.colors[0],
    size: product.sizes[0],
    text: '',
    textColor: 'noir',
    font: 'sans',
    placement: getPlacements(product.type)[0].id,
    logo: null,
    qty: 1,
  };

  const previewGarment = root.querySelector('#previewGarment');
  const printArea = root.querySelector('#printArea');
  const shell = root.querySelector('#previewShell');
  const colorLabel = root.querySelector('#colorLabel');
  const sizeLabel = root.querySelector('#sizeLabel');
  const previewSwatch = root.querySelector('#previewSwatch');
  const previewColorName = root.querySelector('#previewColorName');
  const previewPlacement = root.querySelector('#previewPlacement');
  const unitPriceLabel = root.querySelector('#unitPriceLabel');
  const breakdown = root.querySelector('#priceBreakdown');
  const textInput = root.querySelector('#customText');
  const textCount = root.querySelector('#textCount');
  const fontSelect = root.querySelector('#customFont');
  const placementSelect = root.querySelector('#customPlacement');
  const textColors = root.querySelector('#textColors');
  const logoInput = root.querySelector('#logoInput');
  const logoPreview = root.querySelector('#logoPreview');
  const qtyInput = root.querySelector('#qtyInput');
  const addBtn = root.querySelector('#addToCart');

  const textHex = () => (COLORS[cfg.textColor] || COLORS.noir).hex;

  function paintPreview() {
    if (previewGarment) {
      previewGarment.innerHTML = svgGarment(product.type, {
        color: COLORS[cfg.color].hex,
        label: product.name,
      });
    }

    const geo = printGeometry(product.type, cfg.placement);
    if (printArea) {
      printArea.dataset.placement = cfg.placement;
      printArea.style.top = `${geo.top}%`;
      printArea.style.left = `${geo.left}%`;
      printArea.style.width = `${geo.width}%`;
      printArea.style.transform =
        cfg.placement === 'manche' ? 'translate(-50%, -50%) rotate(18deg)' : 'translateX(-50%)';

      const text = cfg.text.trim();
      const parts = [];

      if (cfg.logo) {
        parts.push(
          `<img class="print-logo" src="${cfg.logo.dataUrl}" alt="" />`
        );
      }

      if (text) {
        const font = getFont(cfg.font);
        parts.push(
          `<span class="print-text" style="font-family:${font.family};color:${textHex()};">${escapeHtml(text)}</span>`
        );
      }

      printArea.innerHTML = parts.join('');
      printArea.style.color = textHex();
    }
  }

  function paintSummary() {
    if (colorLabel) colorLabel.textContent = COLORS[cfg.color].name;
    if (sizeLabel) sizeLabel.textContent = cfg.size;
    if (previewSwatch) previewSwatch.style.background = COLORS[cfg.color].hex;
    if (previewColorName) previewColorName.textContent = COLORS[cfg.color].name;
    if (previewPlacement) previewPlacement.textContent = getPlacementLabel(product.type, cfg.placement);
    if (textCount) textCount.textContent = String(cfg.text.length);

    if (shell) {
      shell.className = `preview-shell tone-${product.tone}`;
    }
  }

  function paintPrice() {
    const unit = unitPriceFor(product, { text: cfg.text, logo: cfg.logo });
    const total = Math.round(unit * cfg.qty * 100) / 100;

    if (unitPriceLabel) unitPriceLabel.textContent = formatPrice(product.price);

    if (breakdown) {
      const rows = [
        `<div><span>${escapeHtml(product.name)}</span><span>${formatPrice(product.price)}</span></div>`,
      ];
      if (cfg.text.trim()) {
        rows.push(`<div><span>Texte personnalisé</span><span>+ ${formatPrice(CUSTOM_PRICES.text)}</span></div>`);
      }
      if (cfg.logo) {
        rows.push(`<div><span>Logo / broderie</span><span>+ ${formatPrice(CUSTOM_PRICES.logo)}</span></div>`);
      }
      rows.push(
        `<div><span>Quantité</span><span>× ${cfg.qty}</span></div>`,
        `<div class="total"><span>Total</span><span>${formatPrice(total)}</span></div>`
      );
      breakdown.innerHTML = rows.join('');
    }
  }

  function paintAll() {
    paintPreview();
    paintSummary();
    paintPrice();
  }

  root.querySelector('#colorSwatches')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-color]');
    if (!btn) return;
    cfg.color = btn.dataset.color;
    root.querySelectorAll('#colorSwatches .swatch').forEach((el) => {
      el.setAttribute('aria-pressed', el === btn ? 'true' : 'false');
    });
    paintAll();
  });

  root.querySelector('#sizeOptions')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-size]');
    if (!btn) return;
    cfg.size = btn.dataset.size;
    root.querySelectorAll('#sizeOptions .size-btn').forEach((el) => {
      el.setAttribute('aria-pressed', el === btn ? 'true' : 'false');
    });
    paintSummary();
  });

  textInput?.addEventListener('input', () => {
    cfg.text = textInput.value.slice(0, MAX_TEXT_LENGTH);
    paintAll();
  });

  fontSelect?.addEventListener('change', () => {
    cfg.font = fontSelect.value;
    paintPreview();
  });

  placementSelect?.addEventListener('change', () => {
    cfg.placement = placementSelect.value;
    paintAll();
  });

  textColors?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-textcolor]');
    if (!btn) return;
    cfg.textColor = btn.dataset.textcolor;
    textColors.querySelectorAll('button').forEach((el) => {
      el.setAttribute('aria-pressed', el === btn ? 'true' : 'false');
    });
    paintPreview();
  });

  logoInput?.addEventListener('change', () => {
    const file = logoInput.files && logoInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Choisissez un fichier image (PNG, JPG, WEBP ou SVG).', 'error');
      logoInput.value = '';
      return;
    }

    if (file.size > 500 * 1024) {
      toast('Fichier trop lourd : 500 Ko maximum.', 'error');
      logoInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      cfg.logo = { name: file.name, dataUrl: String(reader.result) };
      if (logoPreview) {
        logoPreview.hidden = false;
        logoPreview.className = 'upload-preview';
        logoPreview.innerHTML = `<img src="${cfg.logo.dataUrl}" alt="" />
          <span class="file-name">${escapeHtml(file.name)}</span>
          <button type="button" class="btn-ghost" id="removeLogo">Retirer</button>`;
        logoPreview.querySelector('#removeLogo')?.addEventListener('click', () => {
          cfg.logo = null;
          logoPreview.hidden = true;
          logoPreview.innerHTML = '';
          logoInput.value = '';
          paintAll();
        });
      }
      paintAll();
      toast('Logo ajouté à la personnalisation.', 'success');
    };
    reader.onerror = () => toast('Impossible de lire ce fichier.', 'error');
    reader.readAsDataURL(file);
  });

  qtyInput?.addEventListener('change', () => {
    const value = Math.max(1, Math.min(20, Number(qtyInput.value) || 1));
    cfg.qty = value;
    qtyInput.value = String(value);
    paintPrice();
  });

  root.querySelectorAll('.product-buy [data-qty]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const delta = Number(btn.dataset.qty);
      cfg.qty = Math.max(1, Math.min(20, cfg.qty + delta));
      if (qtyInput) qtyInput.value = String(cfg.qty);
      paintPrice();
    });
  });

  addBtn?.addEventListener('click', () => {
    const result = addToCart({
      productId: product.id,
      qty: cfg.qty,
      color: cfg.color,
      size: cfg.size,
      text: cfg.text,
      textColor: cfg.textColor,
      font: cfg.font,
      placement: cfg.placement,
      logo: cfg.logo,
    });

    if (result.ok) {
      toast(result.message, 'success');
    } else {
      toast(result.message, 'error');
    }
  });

  paintAll();
  if (isLight(COLORS[cfg.color].hex)) {
    printArea?.style.setProperty('--print-dark', '1');
  }
}

export const meta = {
  title: 'Pièce — NEY',
  description: 'Personnalisez votre pièce NEY : couleur, taille, texte et logo, avec aperçu et prix en direct.',
};
