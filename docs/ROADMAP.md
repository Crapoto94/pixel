# 🗺️ ROADMAP — PIXEL PANIC

Suivi des demandes et de leur état. (✅ fait · 🔧 en cours · ⏳ à faire)

## Ajustements de gameplay
- 🔧 **Le Glitch n'est PLUS désigné au démarrage** — il est tiré au sort plus tard (à la fin du Monde 1, quand la BORNE annonce l'infiltration). Plus de réveil instantané.
- ⏳ **Missions joueurs affinées** + **réseau d'indices social** : chaque joueur sait *quelque chose* sur un autre (un indice fourni). Sert l'enquête et les interactions.
- ⏳ **Niveau d'énigmes supérieur (style Unlock!)** : de vraies énigmes, pas des codes triviaux.

## Énigmes collaboratives temps réel
- ✅ **Mosaïque de téléphones** : chaque tél affiche un fragment d'un mot géant (ordre mélangé) ; alignés, ils révèlent le code. Bandeau de couleur continu pour aider à l'ordre. *(GM : 🧩 Mosaïque, mot au choix.)*
- ✅ **Séquence musicale collaborative** : chacun détient des notes, il faut les jouer dans le bon ordre pour reproduire la mélodie ; démo + indices pilotables par la GM. *(GM : 🎵 Séquence.)*
- ✅ **PAC-MAN multijoueur** : Mr/Mrs Pac-Man + fantômes (tous humains), borne = plateau commun temps réel, manette sur chaque téléphone. Super-gommes/mode effrayé, vies, scores, victoire Pac/Fantômes. *(GM : bouton 🟡 Pac-Man.)*

## Contenu / ambiance
- 🔧 **Blind-test → CLASSIC ROCK** (pour plaire à tous), et **moins de références metal** partout.
- 🔧 **Musique d'ambiance YouTube** sur la BORNE (boucle, son seul, pause auto pendant le blind-test) — *en attente du lien de mix de Marc*.
- ⏳ **Blind-test YouTube** : lecture auto des extraits (son seul) — *en attente des liens de Marc (il pré-remplit/corrige)*.

## Affichage & production
- ⏳ **BORNE plus explicite** : afficher le scénario, le briefing et les attendus de chaque joueur.
- ✅ **Matériel imprimable** (`/print`) : cartes-avatars **illustrées (SVG)** + QR intégrés, carte dorée Player One, étiquettes COLIS 1-6, jetons PIÈCES/VIES à découper, carte enfants. Bouton Imprimer + mise en page A4.

## Déjà livré
- ✅ Appli (serveur SSE, pages joueur/borne/GM), 6 mondes, gages, votes, QR codes.
- ✅ Quiz culture jeu vidéo (QCM borne→smartphone) + blind-test (structure).
- ✅ Sons 8-bit (Web Audio) + écran d'activation du son.
- ✅ Défi des Pixels (jeu des enfants sur la borne, réveille Vincent au Monde 4).
- ✅ Déploiement Proxmox (LXC) + reverse-proxy Nginx + script `update.sh`.
