# 🗺️ ROADMAP — PIXEL PANIC

Suivi des demandes et de leur état. (✅ fait · 🔧 en cours · ⏳ à faire)

## Ajustements de gameplay
- 🔧 **Le Glitch n'est PLUS désigné au démarrage** — il est tiré au sort plus tard (à la fin du Monde 1, quand la BORNE annonce l'infiltration). Plus de réveil instantané.
- ⏳ **Missions joueurs affinées** + **réseau d'indices social** : chaque joueur sait *quelque chose* sur un autre (un indice fourni). Sert l'enquête et les interactions.
- ⏳ **Niveau d'énigmes supérieur (style Unlock!)** : de vraies énigmes, pas des codes triviaux.

## Énigmes collaboratives temps réel
- ⏳ **Mosaïque de téléphones** : poser les téléphones côte à côte pour reconstituer une image (chaque tel = un fragment).
- ⏳ **Séquence musicale collaborative** : cliquer dans le bon ordre (chacun = une note) pour rejouer un thème de jeu vidéo.
- ⏳ **PAC-MAN multijoueur** : chacun joue sur son téléphone — Mr Pac-Man, Mrs Pac-Man, et les autres en fantômes ; la BORNE affiche le plateau commun en temps réel.

## Contenu / ambiance
- 🔧 **Blind-test → CLASSIC ROCK** (pour plaire à tous), et **moins de références metal** partout.
- 🔧 **Musique d'ambiance YouTube** sur la BORNE (boucle, son seul, pause auto pendant le blind-test) — *en attente du lien de mix de Marc*.
- ⏳ **Blind-test YouTube** : lecture auto des extraits (son seul) — *en attente des liens de Marc (il pré-remplit/corrige)*.

## Affichage & production
- ⏳ **BORNE plus explicite** : afficher le scénario, le briefing et les attendus de chaque joueur.
- ⏳ **Matériel imprimable** : préparer toutes les fiches (cartes-avatars, briefings, cartes-indices, colis, carte dorée…) prêtes à imprimer.

## Déjà livré
- ✅ Appli (serveur SSE, pages joueur/borne/GM), 6 mondes, gages, votes, QR codes.
- ✅ Quiz culture jeu vidéo (QCM borne→smartphone) + blind-test (structure).
- ✅ Sons 8-bit (Web Audio) + écran d'activation du son.
- ✅ Défi des Pixels (jeu des enfants sur la borne, réveille Vincent au Monde 4).
- ✅ Déploiement Proxmox (LXC) + reverse-proxy Nginx + script `update.sh`.
