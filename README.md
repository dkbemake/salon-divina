# Salon Divina — site web

_Beauté, Désir et Divinité._

Site Next.js 16 (App Router) du salon de massage **Salon Divina**, prêt à déployer sur **Netlify** :

- écran d'entrée animé avec vérification d'âge (18 ans et plus) et logo « V » en mains dessinées ;
- pages Accueil, Services, Professionnelles, Réservation et Contact (style identique au site actuel) ;
- formulaire de réservation relié à **Netlify Forms** ;
- espace administrateur protégé pour modifier soins, profils, textes, coordonnées et photos, avec enregistrement permanent dans **Netlify Blobs**.

---

## 1. Déployer sur Netlify

1. Placez ce dossier dans un dépôt Git (GitHub, GitLab ou Bitbucket).
2. Dans Netlify : **Add new site → Import an existing project**, puis choisissez le dépôt.
3. Netlify détecte Next.js automatiquement. Les réglages sont déjà dans `netlify.toml` :
   - commande de build : `npm run build`
   - dossier publié : `.next`
   - plugin : `@netlify/plugin-nextjs`
4. **Avant le premier déploiement**, définissez le mot de passe administrateur (section 2).
5. Cliquez sur **Deploy**.

> Pour mettre à jour le site existant `salon-divina.netlify.app`, reliez ce dépôt au même site Netlify
> (**Site configuration → Build & deploy → Link repository**) au lieu de créer un nouveau site.

Netlify Blobs ne demande aucune configuration : le stockage est créé automatiquement au premier enregistrement.

## 2. Où définir `ADMIN_PASSWORD`

Le mot de passe n'est **jamais écrit dans le code**. Il est lu côté serveur dans une variable d'environnement.

1. Netlify → votre site → **Site configuration → Environment variables**.
2. **Add a variable** :
   - Key : `ADMIN_PASSWORD`
   - Value : un mot de passe long et unique (12 caractères ou plus)
   - Scopes : au minimum **Functions** (ou « All scopes »)
3. Enregistrez, puis **redéployez** le site (Deploys → Trigger deploy) pour que la variable soit prise en compte.

Variable facultative : `SESSION_SECRET` (chaîne aléatoire longue) pour signer les cookies de session. Sans elle, la clé est
dérivée du mot de passe ; changer `ADMIN_PASSWORD` déconnecte alors toutes les sessions ouvertes.

### Se connecter

- Lien discret **« Connexion »** dans le bandeau tout en haut de chaque page (ou directement `/connexion`).
- Identifiant : `stephanie2765`
- Mot de passe : la valeur de `ADMIN_PASSWORD`.

La vérification se fait côté serveur (`app/api/auth/login/route.ts`). Une fois connectée, la session est conservée
8 heures dans un cookie **httpOnly, Secure, SameSite=Strict** signé (HMAC-SHA256). Le bouton **« Déconnexion »** est dans
le bandeau du haut et dans l'espace administrateur.

## 3. Modifier le site (espace administrateur)

Page **`/admin`**, en quatre onglets :

| Onglet | Ce qu'on peut modifier |
| --- | --- |
| **Soins** | ajouter, modifier, réordonner ou supprimer un soin : photo, titre, durée, prix, description, texte alternatif |
| **Professionnelles** | ajouter, modifier, réordonner ou supprimer un profil : prénom, spécialités, présentation et jusqu'à 10 photos (ajout de plusieurs photos d'un coup, ordre par glisser-déposer, remplacement, suppression) |
| **Textes des pages** | tous les titres et textes de l'accueil et des pages Services, Professionnelles, Réservation et Contact |
| **Coordonnées et pied de page** | adresse, téléphone, courriel, Instagram, heures d'ouverture, textes du pied de page |

- Cliquez sur **Enregistrer** (barre du bas) : les changements sont publiés **immédiatement**, sans redéploiement.
- **Téléverser une nouvelle photo** : la photo est redimensionnée (1600 px maximum) et compressée en WebP dans le
  navigateur avant l'envoi, puis stockée dans Netlify Blobs.
- Dans un titre, entourez un mot d'astérisques (`*Désir*`) pour l'afficher en doré italique.
- Prix vide = « Tarif à confirmer ». Dès qu'une vraie adresse est saisie, une carte Google Maps s'affiche sur la page Contact.

## 4. Demandes de réservation (Netlify Forms)

Le formulaire envoie les demandes à Netlify Forms (formulaire `reservation`, déclaré dans `public/__forms.html`).

1. Netlify → **Forms** → activez la détection des formulaires (**Enable form detection**) si ce n'est pas déjà fait, puis redéployez.
2. Les demandes apparaissent dans **Forms → reservation**.
3. Pour les recevoir par courriel : **Site configuration → Notifications → Emails and webhooks → Form submission notifications**.

Un champ piège invisible (« honeypot ») filtre les robots.

## 5. Vérification d'âge

- Toute page demandée sans confirmation est redirigée vers `/verification-age` (fichier `proxy.ts`, exécuté côté serveur
  avant l'affichage).
- « J'ai 18 ans ou plus – Entrer » enregistre le choix dans **localStorage** et dans un cookie (1 an), puis ouvre la page
  demandée. Le visiteur n'a plus à confirmer lors de ses visites suivantes.
- « J'ai moins de 18 ans » mène à `/acces-refuse`, sans aucun lien vers le contenu.
- Pour revoir l'écran d'entrée et son animation après avoir confirmé : ouvrez `/verification-age?revoir`
  (la confirmation mémorisée dans ce navigateur est effacée).
- Les animations respectent le réglage « réduire les animations » du système.

## 6. Référencement

- La balise `noindex` a été retirée : les pages publiques sont indexables (`robots: index, follow`).
- `/robots.txt` et `/sitemap.xml` sont générés automatiquement ; `/admin`, `/connexion` et `/api` sont exclus de l'indexation.
- À noter : comme toutes les pages passent d'abord par la vérification d'âge, les moteurs de recherche verront surtout l'écran
  d'entrée (titre, description et slogan du site).

## 7. Développement local

```bash
npm install
cp .env.example .env.local   # puis choisissez un ADMIN_PASSWORD de test
npm run dev                  # http://localhost:3000
```

Hors de Netlify, le contenu et les photos sont enregistrés dans le dossier `.data/` (ignoré par Git).
Avec la [CLI Netlify](https://docs.netlify.com/cli/get-started/) (`netlify dev`), Netlify Blobs est utilisé comme en production.
Le formulaire de réservation ne fonctionne qu'une fois déployé sur Netlify.

## 8. Structure du projet

```
app/
  (gate)/verification-age     écran d'entrée et vérification d'âge
  (gate)/acces-refuse         page « moins de 18 ans »
  (site)/                     pages publiques (accueil, services, professionnelles, réservation, contact)
  (site)/connexion, admin     connexion et espace administrateur
  api/auth/login, logout      ouverture / fermeture de session
  api/content                 lecture / enregistrement du contenu (protégé)
  api/upload                  téléversement de photos (protégé)
  api/images/[key]            diffusion des photos téléversées
  globals.css                 styles (couleurs et polices du site actuel)
components/
  DivinaV.tsx                 logo « V » en mains (SVG animé)
  AgeGate.tsx, Sparkles.tsx   animation de l'écran d'entrée
  admin/                      éditeur, champ photo, formulaire de connexion
lib/
  content.ts                  modèle de contenu, valeurs par défaut, validation
  store.ts                    stockage (Netlify Blobs, ou .data/ en local)
  auth.ts                     vérification du mot de passe et sessions
  age.ts                      constantes de la vérification d'âge
proxy.ts                      redirection vers la vérification d'âge
public/img/                   photos d'origine du site
public/__forms.html           déclaration du formulaire pour Netlify Forms
```
