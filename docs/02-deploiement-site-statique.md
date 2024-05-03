# Déploiement d'un site statique

On a vu que selon l'application à déployer, les étapes à suivre ne sont pas forcément identiques.

On va commencer par le plus simple : déployer un **site statique** ! Et ça tombe bien, on en a un sous la main : le front-end de l'application Pomodor'O.

Pour déployer un site statique, qui ne comporte que du code HTML, CSS et JS, il suffit de déplacer nos fichiers dans le dossier `/var/www/html` du serveur.

> Déplacer des fichiers sur un serveur ? On fait ça comment ?

Plusieurs solutions nous permettent de copier des fichiers sur un serveur distant, sans y avoir d'accès physique.

## Via le terminal, avec SCP

On connait déjà la commande `cp`, qui permet de copier/coller des fichiers en ligne de commande sur un système GNU/Linux.

On a également découvert tout à l'heure le protocole `ssh`, qui permet de se connecter à un serveur distant et de l'administrer en ligne de commande.

Le protocole **SCP** est la combinaison des deux : comme une copie avec `cp`, mais réalisée entre deux machines distantes à travers le réseau. SCP est l'acronyme de **Secure CoPy**.

L'avantage de ce protocole ? L'utilitaire permettant de faire du SCP est disponible sur **n'importe quel serveur sur lequel vous pouvez vous connecter en SSH**, il n'y a rien à installer.

Pour envoyer un fichier `index.html` depuis votre téléporteur vers votre serveur, dans le dossier `/var/www/html`, vous pourriez lancer la commande SCP suivante :

```bash
scp ./index.html student@PSEUDOGH-server.eddi.cloud:/var/www/html/index.html
```

⚠️ J'ai dit "pourriez", ne lancez pas la commande ci-dessus !

Pour déployer le front-end de notre application en SCP, lancez la commande suivante **depuis votre téléporteur et depuis la racine de ce dépôt** :

```bash
scp -r front/* student@PSEUDOGH-server.eddi.cloud:/var/www/html/
```

Rendez-vous à l'adresse [http://PSEUDOGH-server.eddi.cloud](http://PSEUDOGH-server.eddi.cloud) (remplacez `PSEUDOGH` par votre nom d'utilisateur github). Vous devriez-voir le front-end de notre application, enfin plus exactement un message **impossible de se connecter à l'API**.

Bien que cette solution fonctionne et soit sécurisée, elle est un peu rudimentaire et on va voir d'autres méthodes plus modernes.

## FTP & SFTP

> Plus moderne ? Et tu nous parle de FTP ? 😱

Certains d'entre-vous le connaissent peut-être déjà : le protocole **FTP (File Transfer Protocol)** est, comme son nom l'indique, un protocole dédié au transfert de fichiers.

Ce protocole n'est plus vraiment utilisé de nos jours, mais son successeur, **SFTP (SSH File Transfer Protocol)** est encore utilisé par certains hébergeurs ! (c'est même la seule solution proposée dans certains cas)

Pour utiliser FTP ou SFTP, il faut un logiciel coté serveur et un autre coté client. Coté serveur, nous allons utiliser un script pour installer et configurer automatiquement le logiciel ProFTPd (sa configuration est laborieuse, plutôt réservée à des administrateurs système de métier !).

**Sur votre VM serveur**, lancez les commandes suivantes pour installer ProFTPd :

```bash
cd ~
wget https://gist.githubusercontent.com/bdelphin/b5fbddbe2d86789a920dd2a9d9e5c4ce/raw/29d30954fc0575033fa92c04ca0feafadfa5ee1d/install-ftp.sh
chmod +x ./install-ftp.sh
./install-ftp.sh
```

L'installation du serveur SFTP est terminée 🎉 Conservez les informations données à la fin de l'installation, vous en aurez besoin pour vous connecter coté client.

⚠️ Attention, nous venons de télécharger un script depuis Internet et nous l'avons lancé sur notre serveur sans vérifier son contenu au préalable. Cette pratique est à éviter : le script pourrait par exemple ouvrir une **backdoor** sur notre serveur. Le script en question est parfaitement sûr dans le cas présent.

**Sur votre téléporteur**, lancez la commande suivante pour installer le client FTP FileZilla :

```bash
sudo apt install -y filezilla
```

Vous pouvez ensuite ouvrir FileZilla et vous connecter à votre serveur. Ce logiciel utilise une interface de type "commander", avec deux explorateurs de fichiers ouverts simultanément à gauche et à droite du logiciel. À gauche, vos dossiers locaux, sur votre téléporteur; à droite, les dossiers distants, sur le serveur.

Pour copier les fichiers vers ou depuis le serveur, il suffit de faire un glisser/déposer. On a déjà déployé le front via SCP tout à l'heure, mais on a oublié la favicon !

Faites glisser le fichier `favicon.ico` dans le dossier `/var/www/html` du serveur.

Actualisez la page ouverte tout à l'heure dans votre navigateur (avec `Ctrl+Shift+R`) : c'est bon, la favicon est en place.

C'est un peu mieux que SCP, mais toujours trop rudimentaire comme façon de faire : par exemple, il est **difficile de revenir en arrière en cas de problème** avec le code déployé !

## Git

De nos jours, la plupart des applications sont déployées grâce à Git. Contrairement à un déploiement via SCP ou FTP/SFTP, il sera facile de revenir en arrière en cas de problème.

Nous allons donc cloner notre dépôt sur le serveur, mais avant ça, il faut qu'on **configure une clé SSH** pour pouvoir nous connecter à notre compte Github depuis le serveur.

Lancez la commande suivante, **remplacez `your_email@example.com` par l'adresse email utilisée sur votre compte github** :

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Cette commande va nous demander dans quel fichier sauvegarder la clé (Enter a file in which to save the key), appuyez sur Entrée pour valider l'emplacement par défaut.

La commande va ensuite nous demander si on souhaite mettre un mot de passe sur la clé (Enter passphrase), appuyez sur Entrée pour ne pas mettre de mot de passe.

Une fois la clé générée, il faut l'ajouter sur notre compte github. Affichez la clé publique avec la commande suivante :

```bash
cat ~/.ssh/id_ed25519.pub
```

Copiez la clé et l'adresse email.

Rendez-vous dans les [paramètres des clés SSH et GPG de votre compte github](https://github.com/settings/keys), puis cliquez sur le bouton vert `New SSH key`.

Donnez un nom à cette clé dans le champ `Title`, puis collez la clé publique copiée précédemment dans le champ `Key`. Laissez `Key type` sur le réglage "Authentication Key". Enregistrez la clé en cliquant sur le bouton vert `Add SSH key`.

À ce stade, on peut maintenant cloner le dépôt dans le dossier `/var/www/html` avec la commande suivante (remplacez `PROMO` par le nom de votre promotion) :

```bash
cd /var/www/html
git clone git@github.com:O-clock-PROMO/S08-PHP-Pomodor-O.git 
```

⚠️ Problème : notre front-end est dans le dossier `front/`, pas dans le dossier `/var/www/html` directement ... il faut donc se rendre sur [http://bdelphin-server.eddi.cloud/S08-PHP-Pomodor-O/front/](http://bdelphin-server.eddi.cloud/S08-PHP-Pomodor-O/front/) pour y accéder. Pas génial non ?

⚠️ Il y a également un problème de sécurité ! Le dossier `.git` de notre dépôt se retrouve exposé par le serveur web Apache 😱 (pour rappel, ce dossier contient l'historique complet des commits du dépôt, l'adresse du dépôt sur github, etc.)

> Pas grave, on a qu'à déplacer les fichiers et supprimer ce dossier `.git` ?

On pourrait effectivement utiliser des commandes `mv` et `rm` / `rmdir` pour déplacer les fichiers au bon endroit et supprimer les informations sensibles, mais dans ce cas-là on perd le principal intéret de déployer via Git : on ne pourra plus revenir en arrière en cas de problème !

La solution ? On va mettre en place un **virtual host Apache**.

Il nous reste également le back-end de l'application à déployer, et ça tombe bien, on aura besoin des **virtual hosts** pour ça aussi.

Avant de passer à la suite, supprimons les fichiers de notre front-end que nous avons déployé via SCP et SFTP :

```bash
cd /var/www/html
rm -rf assets/ favicon.ico index.html
```

Et pour la suite, c'est par [ici](./03-virtual-hosts.md) !
