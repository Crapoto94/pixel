# Sons Pac-Man (optionnels)

Par défaut, le jeu Pac-Man utilise des sons **recréés en 8-bit** (synthèse Web
Audio, dans `static/sound.js` → `SFX.pac`). Rien à installer : ça marche tout
de suite, hors-ligne.

Si tu veux les **vrais bruitages**, dépose ici des fichiers audio avec ces noms
exacts (l'un de `.mp3`, `.ogg` ou `.wav`). Le jeu les détecte automatiquement et
les joue À LA PLACE des sons synthétisés ; un nom manquant retombe sur la
synthèse.

| Fichier | Joué quand… |
|---|---|
| `intro.mp3`    | coup d'envoi de la manche |
| `chomp.mp3`    | Pac mange une gomme (waka-waka) |
| `power.mp3`    | super-gomme avalée (mode fantômes bleus) |
| `eatghost.mp3` | Pac mange un fantôme |
| `death.mp3`    | un Pac se fait attraper |
| `fruit.mp3`    | bonus fruit |
| `extend.mp3`   | vie supplémentaire |
| `win.mp3`      | l'équipe Pac gagne |
| `lose.mp3`     | les fantômes gagnent |

> ⚠️ La bande-son originale de Pac-Man est **sous copyright (© Bandai Namco)**.
> Ces fichiers ne sont volontairement PAS fournis dans le dépôt. Si tu les
> ajoutes (par ex. depuis ta propre copie / un rip), garde-les pour un usage
> privé et ne les redistribue pas. Astuce : `chomp` doit être très court
> (~0,1 s) car il est rejoué à chaque gomme.
