/**
 * NEY — Vue 404
 */

export function render() {
  return `<div class="view">
    <div class="confirm">
      <span class="eyebrow" style="justify-content:center;">Erreur 404</span>
      <h1>Cette page n’existe pas</h1>
      <p class="lead">
        Le lien est peut-être ancien, ou la pièce a changé de nom. Tout le catalogue reste
        disponible : aucune gestion de stock, donc aucune rupture.
      </p>
      <div class="confirm-actions">
        <a class="btn btn-dark" href="#/boutique">Voir la boutique</a>
        <a class="btn btn-outline" href="#/">Retour à l’accueil</a>
      </div>
    </div>
  </div>`;
}

export function mount() {}

export const meta = {
  title: 'Page introuvable — NEY',
  description: 'Cette page n’existe pas. Retrouvez la boutique NEY.',
};
