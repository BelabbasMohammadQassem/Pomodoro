# Déploiement d'une application Laravel

Notre back-end a été réalisé avec le framework Laravel. Quand on clone un projet Laravel, en production ou en développement, on doit effectuer quelques actions pour que le projet fonctionne.

## Installation des dépendances

Il faut qu'on installe les dépendances de notre projet avec **Composer**. Problème, on ne l'a pas encore installé !

Pour installer Composer sur un serveur Ubuntu 22.04, on suit la [doc officielle](https://getcomposer.org/download/) :

```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php -r "if (hash_file('sha384', 'composer-setup.php') === 'e21205b207c3ff031906575712edab6f13eb0b361f2085f1f1237b7126d785e826a450292b6cfd1d64d92e6563bbde02') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/local/bin/composer
```

Une fois toutes ces commandes lancées, Composer devrait être installé. Vous pouvez le vérifier avec la commande `composer --version` (vous devriez avoir **au moins** la version 2.0 de Composer).

On peut maintenant installer les dépendances de notre projet :

```bash
cd /var/www/html/S08-PHP-Pomodor-O-{{PSEUDO-GH}}/back/
composer install
```

> Mais c'est quoi cette erreur dans la console ? 😱

Si on regarde attentivement le message d'erreur (`Your Composer dependencies require a PHP version ">= 8.2.0". You are running 8.1.2-1ubuntu2.14.`), on peut voir que notre backend Laravel a été codé sur PHP 8.2.0 ... or sur notre serveur c'est PHP 8.1.2 qui est installé !

C'est un problème très courant : l'environnement de développement n'est pas identique à l'environnement de production ! On découvrira par la suite comment éviter ce problème, en utilisant des conteneurs Docker pour le développement & la production.

Mais en attendant, on va faire un petit ajustement dans le fichier `composer.json` pour que le backend fonctionne :

```bash
nano composer.json
```

À la 8ème ligne, remplacez `"php": "^8.2",` par `"php": "^8.1",`.

Comme d'habitude, quittez `nano` et enregistrez les modifications en utilisant le raccourci clavier `Ctrl+X`, puis `Y` et `Entrée`.

Relancez l'installation des dépendances :

```bash
composer install
```

Plus de message d'erreur 🎉

## Configuration des variables d'environnement

Notre backend Laravel a également besoin d'un fichier `.env`, dans lequel on va définir plusieurs variables liées à notre environnement de production, comme par exemple les identifiants de connexion à la base de données.

Faites une copie du fichier `.env.example` avec la commande suivante :

```bash
cp .env.example .env
```

Puis modifions ce fichier avec `nano` :

```bash
nano .env
```

Configurez les variables d'environnement de la base de données avec les valeurs suivantes :

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pomodoro
DB_USERNAME=explorateur
DB_PASSWORD=Ereul9Aeng
```

Comme d'habitude, quittez `nano` et enregistrez les modifications en utilisant le raccourci clavier `Ctrl+X`, puis `Y` et `Entrée`.

Avant de passer à la suite, il nous reste une dernière variable d'environnement à configurer : la clé d'application (`APP_KEY`) Laravel. On peut demander à Laravel d'en générer une avec la commande suivante :

```bash
php artisan key:generate
```

## Import de la base de données

Dernière étape : il faut qu'on importe la base de données ! Un script `DB.sql` est disponible à la racine du dépôt. On pourrait l'importer via Adminer ou PHPMyAdmin, mais on peut aussi l'importer avec la commande suivante :

```bash
cd ..
mysql -u explorateur -p < DB.sql
```

💡 Utilisez le mot de passe habituel de l'utilisateur explorateur : `Ereul9Aeng`. **Attention, là encore les caractères du mot de passe n'apparaissent pas pendant la saisie.**

## Permissions

À ce stade, si vous vous rendez sur [http://backend.PSEUDOGH-server.eddi.cloud/](http://backend.PSEUDOGH-server.eddi.cloud/), vous devriez avoir une erreur Laravel indiquant `The stream or file "/var/www/html/S08-PHP-Pomodor-O/back/storage/logs/laravel.log" could not be opened in append mode: Failed to open stream: Permission denied`.

Ce message d'erreur nous indique que Laravel n'a pas la permission (`Permission denied`) pour écrire dasn son fichier de logs (`logs/laravel.log`). Vérifions les droits dans le dossier !

```bash
cd /var/www/html/S08-PHP-Pomodor-O-PSEUDOGH
ls -alh
```

On peut voir que sur le dossier `back`, seul l'utilisateur `student` a les droits d'écriture (`drwxrwxr-x 12 student student  4.0K Oct 25 10:42 back`). Nous avions pourtant donné les droits d'écriture également au groupe `www-data`, mais les permissions ont été modifiées quand on a cloné le dépôt.

Relançons la commande de l'étape 1 :

```bash
sudo chown -R student:www-data ./
```

Actualisez la page, l'erreur Laravel devrait avoir disparue ! 🎉

## Réécriture d'URL & .htaccess

Si vous essayez d'accéder à la route `/api/tasks` en GET sur notre backend depuis votre navigateur ([http://backend.PSEUDOGH-server.eddi.cloud/api/tasks](http://backend.PSEUDOGH-server.eddi.cloud/api/tasks)), vous allez avoir une erreur 404.

> Mais comment ça se fait, pourtant la route `/` fonctionne !

Le problème vient de la réecriture d'URL intégrée à Laravel : pour qu'elle fonctionne, on doit activer le module de réecriture d'Apache et modifier sa configuration pour qu'il prenne en compte le fichier `.htaccess` dans le dossier `public`.

Lancez les deux commandes ci-dessous :

```bash
sudo sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride all/' /etc/apache2/apache2.conf
sudo a2enmod rewrite
sudo systemctl restart apache2
```

💡 La première commande utilise `sed` (un utilitaire permettant de faire des modifications dans des fichiers texte) pour remplacer la directive `AllowOverride None` par `AllowOverride all` dans le fichier de configuration d'Apache `/etc/apache2/apache2.conf`.

💡 La deuxième commande permet d'activer le module de réécriture d'URL d'Apache grâce à l'utilitaire `a2enmod` (Apache2 ENable MODule).

Si on essaye à nouveau d'accéder à la route `/api/tasks`, nous ne devrions plus avoir d'erreur 404.

## Configuration du frontend

Mais si on retourne sur le frontend ([http://PSEUDOGH-server.eddi.cloud/](http://PSEUDOGH-server.eddi.cloud/)), on a toujours le message d'erreur `impossible de se connecter à l'API`. Pour que le front puisse se connecter au back, il faut qu'on modifie une variable d'environnement coté frontend :

```bash
nano front/assets/js/settings.js
```

Remplacez la ligne `baseAPIURL: "http://localhost:3000"` par `baseAPIURL: "http://backend.PSEUDOGH-server.eddi.cloud"`.

Enregistrez les modifications et quittez `nano`, puis actualisez la page sur le frontend. Ça y est, nous n'avons plus aucune erreur, notre application est officiellement en production 🎉
