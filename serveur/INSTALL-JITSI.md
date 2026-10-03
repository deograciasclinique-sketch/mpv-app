# Installer le serveur de visio de l'église (Jitsi Meet)

Tant que ce serveur n'existe pas, l'app crée des liens `meet.jit.si` qui s'ouvrent
**en dehors** de l'app (le serveur public coupe au bout de 5 minutes les réunions
intégrées dans une app). Une fois le serveur installé, les réunions s'ouvrent
**dans l'app**, avec chat, salle d'attente, partage d'écran et enregistrement.

## 1. Ce qu'il faut louer

- Un **VPS Ubuntu 22.04 ou 24.04** : **4 vCPU, 8 Go RAM** minimum pour 50+ participants,
  avec une bonne bande passante. Datacenter en Europe de l'Ouest (Paris, Francfort)
  pour une latence correcte depuis le Burkina.
- Un **nom de domaine** pointant vers l'IP du VPS, ex. `visio.mpvburkina.org`
  (enregistrement de type A).
- Ports ouverts : **80/tcp, 443/tcp, 10000/udp**. Le 10000/udp est indispensable pour la vidéo.

## 2. Installation (méthode officielle Docker)

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
git clone https://github.com/jitsi/docker-jitsi-meet && cd docker-jitsi-meet
cp env.example .env
./gen-passwords.sh
mkdir -p ~/.jitsi-meet-cfg/{web,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}
```

Dans le fichier `.env`, modifier :

```ini
PUBLIC_URL=https://visio.mpvburkina.org
TZ=Africa/Ouagadougou

# Certificat HTTPS gratuit
ENABLE_LETSENCRYPT=1
LETSENCRYPT_DOMAIN=visio.mpvburkina.org
LETSENCRYPT_EMAIL=votre-email@exemple.com

# Seuls les ORGANISATEURS (comptes créés plus bas) peuvent ouvrir une réunion.
# Les autres participants entrent sans compte, une fois la réunion ouverte.
ENABLE_AUTH=1
AUTH_TYPE=internal
ENABLE_GUESTS=1

# Salle d'attente, pas de page d'accueil intermédiaire
ENABLE_LOBBY=1
ENABLE_PREJOIN_PAGE=0

# Enregistrement (voir étape 5)
ENABLE_RECORDING=1
```

Démarrer :

```bash
docker compose up -d
```

## 3. Créer les comptes organisateurs

Un compte par pasteur / responsable qui anime des réunions :

```bash
docker compose exec prosody prosodyctl --config /config/prosody.cfg.lua \
  register pasteur.sare meet.jitsi UnMotDePasseSolide
```

(Remplacer `pasteur.sare` et le mot de passe. `meet.jitsi` reste tel quel.)

Fonctionnement pendant la réunion :
- Les participants qui arrivent avant l'organisateur voient « En attente de l'organisateur ».
- L'organisateur touche **« Je suis l'organisateur »**, saisit son compte : la réunion s'ouvre
  et il devient **modérateur** (admettre, couper les micros, exclure, enregistrer).

## 4. Salle d'attente

Le modérateur l'active dans la réunion : bouton **Sécurité (bouclier) → Salle d'attente**.
Ensuite chaque nouvel arrivant attend que le modérateur l'admette.

## 5. Enregistrement (Jibri)

Jibri enregistre en ouvrant un navigateur invisible sur le serveur : il consomme
environ **4 vCPU / 8 Go par enregistrement en cours**.

- Petit budget : un seul VPS de 8 vCPU / 16 Go, un enregistrement à la fois.
- Mieux : un 2e VPS dédié à Jibri, allumé seulement les jours d'enregistrement.

```bash
# module son virtuel requis par Jibri (sur le VPS)
sudo apt install -y linux-image-extra-virtual
echo "snd-aloop" | sudo tee -a /etc/modules && sudo modprobe snd-aloop

docker compose -f docker-compose.yml -f jibri.yml up -d
```

Les fichiers MP4 arrivent dans `~/.jitsi-meet-cfg/jibri/recordings/`.
Pensez à les copier ailleurs (Google Drive, disque) : le VPS a peu d'espace.

## 6. Brancher l'app sur le serveur

Dans `src/visio.js`, remplacer :

```js
export const VISIO_SERVER = "meet.jit.si";
```

par :

```js
export const VISIO_SERVER = "visio.mpvburkina.org";
```

Envoyer sur GitHub : Vercel met l'app à jour tout seul.
Les **nouvelles** réunions utiliseront le serveur de l'église. Pour une réunion déjà
créée, ouvrez-la et touchez « Nouveau lien ».

## 7. Vérifications

- [ ] `https://visio.mpvburkina.org` s'ouvre avec le cadenas HTTPS
- [ ] Port 10000/udp ouvert dans le pare-feu du VPS **et** chez l'hébergeur
- [ ] Réunion test à 3 téléphones : vidéo, chat, son
- [ ] Partage d'écran depuis un ordinateur
- [ ] L'organisateur se connecte et peut activer la salle d'attente et l'enregistrement
