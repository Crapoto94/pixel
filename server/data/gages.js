// =====================================================================
//  Catalogue de gages — ambiance festive mais alcool LÉGER & OPTIONNEL.
//  Règle d'or : jamais de cul-sec. Au pire une GORGÉE, et TOUJOURS une
//  alternative sans alcool (alt). Le fun vient du défi, pas de la cuite.
//
//  intensity : 1 = léger · 2 = moyen · 3 = costaud (jamais alcool fort)
//  alt       : alternative sans alcool (toujours proposée)
//  pool      : contextes où la BORNE peut piocher ce gage
// =====================================================================

export const GAGES = [
  { id: 'continue', titre: 'CONTINUE ?', desc: 'Tu as 10 s pour répondre à la BORNE.', alt: 'Sinon : une grimace tenue 30 s OU une gorgée.', intensity: 1, pool: ['solo'] },
  { id: 'lag', titre: 'LAG', desc: 'Tu parles au RALENTI jusqu’au prochain monde.', alt: 'Si tu craques : 5 pompes OU une gorgée.', intensity: 1, pool: ['solo'] },
  { id: 'boss-music', titre: 'BOSS MUSIC', desc: 'Chante l’intro d’un jeu vidéo culte (ou un riff rock connu).', alt: 'Refus : tu mimes le boss final pendant 20 s.', intensity: 1, pool: ['solo', 'rock'] },
  { id: 'pixel-perfect', titre: 'PIXEL PERFECT', desc: 'Défi d’adresse : empile 3 objets / vise un gobelet.', alt: 'Raté : tu offres la prochaine tournée (soft ou non).', intensity: 1, pool: ['solo', 'defi'] },
  { id: 'air-guitar', titre: 'AIR GUITAR', desc: 'Solo d’air-guitar de 15 s sur un riff rock culte. La salle juge.', alt: 'Raté : tu chantes le refrain a cappella.', intensity: 2, pool: ['solo', 'rock'] },
  { id: 'marathon', titre: 'MARATHON', desc: '15 squats ou pompes (au choix). Endurance, l’ami.', alt: 'Refus : course sur place 30 s OU une gorgée.', intensity: 2, pool: ['solo', 'sport'] },
  { id: 'smash', titre: 'SMASH', desc: 'Duel de réflexes : premier à attraper l’objet lancé.', alt: 'Le perdant fait le service de badminton imaginaire 5×.', intensity: 1, pool: ['duel', 'sport'] },
  { id: 'jardin', titre: 'PHOTOSYNTHÈSE', desc: 'Tu deviens une plante : bras en l’air, immobile, jusqu’au prochain indice.', alt: 'Tu bouges : tu arroses (sers) quelqu’un OU gorgée.', intensity: 1, pool: ['solo'] },
  { id: 'mirror', titre: 'MODE MIROIR', desc: 'Tu parles à l’envers (dernier mot d’abord) jusqu’au prochain monde.', alt: 'Tu craques : accent random pendant 5 min.', intensity: 2, pool: ['solo'] },
  { id: 'co-op', titre: 'CO-OP', desc: 'Choisis un binôme : vous faites équipe (et trinquez léger) jusqu’au prochain monde.', alt: 'Sans alcool : vous devez tout vous dire en rimes.', intensity: 1, pool: ['solo'] },
  { id: 'selfie', titre: 'TROPHÉE DÉBLOQUÉ', desc: 'Pose photo héroïque obligatoire avec un objet de la pièce comme “épée légendaire”.', alt: '—', intensity: 1, pool: ['solo', 'fun'] },
  { id: 'compliment', titre: 'BUFF', desc: 'Lance un “buff” : fais un vrai compliment sincère à la personne à ta gauche.', alt: '—', intensity: 1, pool: ['solo', 'fun'] },
  { id: 'royalty', titre: 'ROYALTY 👑', desc: 'Le PLAYER ONE désigne qui relève le prochain défi. Sans justification.', alt: '—', intensity: 2, pool: ['vincent'] },
  { id: 'exil', titre: 'BANNI 2 MIN', desc: 'Tu es éjecté du jeu 2 min (va “recharger”). Reviens avec une boisson pour quelqu’un.', intensity: 1, pool: ['solo', 'fun'] },
  { id: 'cheers-collectif', titre: 'CHEERS COLLECTIF 🥂', desc: 'Toute la table fait un “cheers” (gorgée ou soft, au choix de chacun).', alt: '—', intensity: 1, pool: ['collectif'] },
];

// Tire un gage au hasard, filtré par pool si fourni.
export function pickGage(pool = null, rng = Math.random) {
  const candidats = pool ? GAGES.filter((g) => g.pool.includes(pool)) : GAGES;
  const liste = candidats.length ? candidats : GAGES;
  return liste[Math.floor(rng() * liste.length)];
}
