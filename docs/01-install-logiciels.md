# Installation & configuration d'un environnement de production PHP

C'est parti, on a loué notre premier serveur, et on veut déployer une application PHP en production dessus !

Comment on fait ça ? 🤔

## Logiciels requis

Déjà, essayons de lister les logiciels dont on va avoir besoin :

- Apache, le serveur web
- L'interpréteur PHP
- Git, pour cloner notre dépôt
- MySQL/MariaDB, notre SGBDR
- PHPMyAdmin ou Adminer pour administrer nos BDD

Mais comment on les installe, ces logiciels ?

## Connexion au serveur

On l'a vu, il n'y a pas d'écran connecté à un serveur, donc pas d'interface graphique.

> Comment on fait pour administrer ce serveur du coup ? 🤔

En nous-y connectant en SSH !

![projection astrale](images/ssh_astral.jpg)

Le **protocole SSH (Secure SHell)** est un protocole de communication sécurisé qui permet d'**accéder à distance à un serveur**. Il permet d'ouvrir une session à distance pour exécuter des commandes, transférer des fichiers, etc.

Pour se connecter à un serveur en SSH, on a besoin de deux choses (ces informations sont fournies par l'hébergeur) :

- L'adresse IP du serveur (ou son nom de domaine, s'il en a un)
- Un utilisateur et un mot de passe

On utilise ensuite la commande suivante pour établir la connexion :

```bash
ssh nom_utilisateur@ip_ou_nom_de_domaine
```

Dans notre cas, on se connecte à la VM Serveur Kourou avec la commande suivante :

```bash
ssh student@PSEUDOGH-server.eddi.cloud
```

💡 Pensez à remplacer `PSEUDOGH` par votre pseudo GitHub !

Lors de la première connexion au serveur, on va avoir un message d'avertissement qui va nous demander si on est sûr de vouloir se connecter à ce serveur, identifié par son "empreinte". On va répondre `yes`.

💡 Par défaut, le protocole SSH fonctionne sur le port 22. Pour des raisons de sécurité, ce port est parfois changé. On utilise dans ce cas la commande `ssh -p 2222 user@domain` (remplacer `2222` par le port d'écoute du serveur SSH).

## Installation des logiciels

Une fois connecté au serveur, on va pouvoir commencer à le configurer pour qu'il puisse accueillir notre application PHP.

On va commencer par mettre à jour les paquets installés sur le serveur avec la commande `apt update` :

```bash
sudo apt update
```

💡 Le mot de passe de l'user student est `par dessus les nuages`. ⚠️ **ATTENTION, les caractères du mot de passe ne sont pas visibles, c'est normal.**

Cette commande nécessite les privilèges administrateur, on doit donc précéder la commande de `sudo`. Sur certains distributions GNU/Linux, `sudo` n'est pas installé par défaut, il faut alors utiliser la commande `su` pour changer d'utilisateur.

Ensuite, on va installer les logiciels dont on va avoir besoin pour faire fonctionner notre application PHP :

- Apache, le serveur web
- PHP, l'interpréteur PHP
- MySQL/MariaDB, notre SGBDR

Pour installer ces logiciels, on va utiliser la commande `apt install` :

```bash
sudo apt install -y apache2 php libapache2-mod-php mariadb-server php-mysql
```

💡 L'argument `-y` permet d'éviter de demander une confirmation à l'utilisateur.

<details>
  <summary>Description de chaque paquet installé</summary>
  
  - apache2 : le serveur web Apache
  - php : l'interpréteur PHP dans sa dernière version disponible sur notre distribution GNU/Linux
  - libapache2-mod-php : un paquet permettant de configurer Apache pour fonctionner avec PHP
  - mariadb-server : le SGBDR MariaDB
  - php-mysql : une extension PHP permettant de se connecter à un serveur MySQL/MariaDB
  
</details>

Une fois ces paquets installés, on peut ouvrir un navigateur et se rendre à l'adresse de notre serveur. Nous devrions voir la page par défaut d'Apache.

💡 On peut vérifier quelle version de PHP a été installée avec la commande `php -v`.

## Configuration MySQL/MariaDB

Notre SGBDR, MySQL ou MariaDB, doit être configuré correctement pour pouvoir être utilisé en toute sécurité par notre application PHP. La première étape est de lancer la commande `mysql_secure_installation`, prévue spécialement pour sécuriser une installation de MySQL/MariaDB :

```bash
sudo mysql_secure_installation
```

Cette commande va nous poser plusieurs questions :

- On nous demande le mot de passe actuel de l'administrateur (`root`). On peut directement appuyer sur Entrée, le mot de passe n'est pas défini pour l'instant.
- On nous demande si on veut changer le mode d'authentification par le mode `unix_socket`. On va répondre `Y` pour oui.
- On nous demande si on veut définir un mot de passe pour l'administrateur (`root`). On va répondre `Y` pour oui. Choisissez ensuite un mot de passe solide.
- On nous demande si on veut supprimer les utilisateurs anonymes. On va répondre `Y` pour oui.
- On nous demande si on veut interdire la connexion à distance de l'administrateur (`root`) à la base de données. On va répondre `Y` pour oui.
- On nous demande si on veut supprimer la base de données de test. On va répondre `Y` pour oui.
- On nous demande si on veut recharger les privilèges. On va répondre `Y` pour oui.

Ensuite, on doit créer un utilisateur. On va se connecter à l'interface en ligne de commande de MySQL/MariaDB avec la commande `mysql` :

```bash
sudo mysql
```

On peut ensuite lancer les deux requêtes SQL suivantes pour créer un utilisateur `explorateur` et lui donner les droits sur toutes les bases de données :

```sql
CREATE USER 'explorateur'@'localhost' IDENTIFIED BY 'Ereul9Aeng';
GRANT ALL PRIVILEGES ON *.* TO 'explorateur'@'localhost' WITH GRANT OPTION;
```

⚠️ Attention, si vous déployez un serveur de production, pensez à utiliser un mot de passe solide !

Tapez `exit` pour quitter l'utilitaire en ligne de commande de MySQL/MariaDB.

## Adminer & PHPMyAdmin

Maintenant que notre SGBDR est correctement configuré, on va installer un outil pour l'administrer facilement. Il existe deux outils populaires pour administrer MySQL/MariaDB :

- Adminer
- PHPMyAdmin

### PHPMyAdmin

Pour installer PHPMyAdmin, il suffit de lancer la commande suivante :

```bash
sudo apt install phpmyadmin
```

⚠️ Lors de l'installation, on va nous demander de choisir le serveur web utilisé, qui sera configuré automatiquement. On va devoir cocher la case `apache2` avec la barre d'espace, puis valider avec `tab` et `enter`.

On va également nous demander s'il faut configurer une base de données pour PHPMyAdmin, on peut répondre `Yes`. On va ensuite choisir un mot de passe pour l'utilisateur `phpmyadmin`, nous n'aurons pas besoin de connaître ce mot de passe, on peut donc laisser le champ vide pour qu'un mot de passe aléatoire soit généré. Appuyez directement sur Entrée.

À ce stade, vous devriez pouvoir accéder à PHPMyAdmin à l'adresse `http://PSEUDOGH-server.eddi.cloud/phpmyadmin` (remplacez `PSEUDOGH` par votre pseudo GitHub).

Si vous avez fait une erreur à l'étape de choix du serveur web à configurer automatique, PHPMyAdmin ne fonctionnera pas. Pour résoudre le problème, on doit re-configurer PHPMyAdmin avec la commande `dpkg-reconfigure` :

```bash
sudo dpkg-reconfigure phpmyadmin
```

⚠️ Ne lancez cette commande **que si PHPMyAdmin ne fonctionne pas !**

À la question "reinstall database for phpmyadmin?" répondez `No`. L'étape d'après sera la configuration automatique du serveur web, cochez bien `apache2` **avec la barre d'espace** et validez avec `tab` et `enter`.

### Adminer

Adminer est une interface web d'administration de MySQL/MariaDB en un seul fichier PHP ! Pour l'installer, il suffit de télécharger le fichier en question et de le déposer dans le dossier `/var/www/html/adminer`, avec les commandes suivantes :

```bash
sudo mkdir /var/www/html/adminer
cd /var/www/html/adminer
sudo wget https://github.com/vrana/adminer/releases/download/v4.8.1/adminer-4.8.1-mysql.php
sudo mv adminer-4.8.1-mysql.php index.php
```

C'est tout ! Vous pouvez maintenant accéder à Adminer à l'adresse `http://PSEUDOGH-server.eddi.cloud/adminer` (remplacez `PSEUDOGH` par votre pseudo GitHub).

💡 Pas génial tout ces `sudo` qu'on doit faire en permanence, non ? On va voir comment y remédier.

## Le dossier `/var/www/html`

Le dossier `/var/www/html` est le dossier racine du serveur web Apache. C'est dans ce dossier que l'on va en général déployer notre application PHP. Avant de passer au déploiement, deux dernières petites choses à faire sur ce dossier.

### Permissions & propriétaire

Pour pouvoir déployer notre application PHP sans avoir à utiliser `sudo` pour chaque commande, on va devoir modifier les permissions du dossier `/var/www/html` pour que notre utilisateur `student` puisse y écrire. 

Pour visualiser les permissions du dossier `/var/www/html`, on peut utiliser la commande `ls -l` :

```bash
ls -alh /var/www/html
```

`-l` est l'argument qui permet de visualiser les permissions, mais il est utile de le joindre aux arguments `-a` et `-h`, permettant respectivement de lister tous les fichiers & dossiers (y compris les fichiers cachés) et d'afficher les tailles des fichiers en octets, kilo-octets, etc. (plutôt qu'en nombre de blocs).

Vous devriez voir quelque chose comme ça :

```bash
student@PSEUDOGH-server:/var/www/html$ ls -alh
total 24K
drwxr-xr-x 3 root root 4.0K Oct  6 09:55 .
drwxr-xr-x 3 root root 4.0K Oct  5 15:15 ..
drwxr-xr-x 2 root root 4.0K Oct  6 09:56 adminer
-rw-r--r-- 1 root root  11K Oct  5 15:15 index.html
```

On peut voir que le dossier `/var/www/html` (`.`) appartient à l'utilisateur `root` et au groupe `root`. Les permissions sont `rwxr-xr-x`, ce qui signifie que l'utilisateur `root` a tous les droits (`rwx`), mais que les autres utilisateurs n'ont que les droits de lecture et d'exécution (`r-x`).

On va changer le propriétaire du dossier par notre l'utilisateur `student`, mais aussi par le groupe `www-data`. L'utilisateur du même nom, `www-data`, est utilisé pour l'exécution du serveur web Apache : il doit donc avoir les droits d'écriture sur le dossier `/var/www/html` pour que nos applications web puissent y écrire si nécessaire (par exemple, pour les logs de Laravel).

```bash
sudo chown -R student:www-data /var/www/html
```

`student` est maintenant propriétaire, et il a les droits d'écriture. Mais le groupe `www-data` n'a toujours que les droits de lecture ! On va donc remédier à cela :

```bash
sudo chmod -R g+w /var/www/html
```

💡 Rappel : `g+w` signifie "ajouter (+) les droits d'écriture (w) au groupe (g)". On aurait également pu utiliser la notation octale : 

```bash
sudo chmod -R 775 /var/www/html
```

💡 Rappel : `775` correspond aux droits de lecture, écriture et exécution (4+2+1) pour l'utilisateur propriétaire & le groupe propriétaire, et seulement les droits de lecture et d'exécution (4+1) pour les autres utilisateurs.

On peut relancer la commande `ls -alh` pour vérifier que les permissions ont bien été modifiées :

```bash
ls -alh /var/www/html
```

On devrait obtenir ceci :

```bash
student@bdelphin-server:/var/www/html$ ls -alh
total 24K
drwxrwxr-x 3 student www-data 4.0K Oct  6 09:55 .
drwxr-xr-x 3 root    root     4.0K Oct  5 15:15 ..
drwxrwxr-x 2 student www-data 4.0K Oct  6 09:56 adminer
-rw-rw-r-- 1 student www-data  11K Oct  5 15:15 index.html
```

On peut voir que grace à l'argument `-R`, les permissions ont été modifiées récursivement sur tous les fichiers et dossiers contenus dans `/var/www/html`, comme par exemple le fichier `index.html` ou le dossier `adminer`.

### Suppression du fichier `index.html`

Par défaut, Apache2 affiche le fichier `index.html` lorsqu'on se rend à l'adresse du serveur. On va donc supprimer ce fichier pour qu'il n'y ait pas de conflit avec notre application PHP.

De plus, ce fichier divulgue des informations potentiellement sensibles sur notre serveur, comme par exemple la version d'Apache2 ou le système d'exploitation utilisé. Il est donc préférable de le supprimer pour des raisons de sécurité.

```bash
rm /var/www/html/index.html
```

💡 Vous remarquerez que maintenant que l'utilisateur `student` a les droits d'écriture, plus besoin de la commande `sudo` 🎉

La suite ? On va déployer le front-end de notre application sur notre serveur ! Ça se passe par [ici](./02-deploiement-site-statique.md).
