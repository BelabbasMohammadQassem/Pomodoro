# Construire nos propres images Docker

On a vu qu'on pouvait facilement démarrer un environnement de développement PHP grâce à Docker et l'image officielle PHP, mais cet environnement n'est pas complet : il nous manque par exemple le gestionnaire de dépendances Composer !

Pour remédier à cela, nous allons **construire notre propre image Docker** !

Nous allons nous baser sur l'image officielle PHP et la "personnaliser" pour qu'elle puisse héberger notre backend Laravel.

Pour construire une image Docker, on a besoin d'un **Dockerfile**.

## Dockerfile

Le **Dockerfile** est un fichier propre à Docker, qui permet de créer nos propres images Docker personnalisées à partir d'images existantes.

⚠️ Attention, ce fichier **doit s'appeller Dockerfile**, sans extension et avec un `D` majuscule.

Sa syntaxe est spécifique à Docker, on y décrit plusieurs instructions qui seront traitées une par une.

Une partie des instructions disponibles (les plus utiles) :

- `FROM <image>` : en général la première instruction, permet d'indiquer **à partir de quelle image on veut construire la notre**.
- `RUN <command>` : permet de lancer une commande dans le conteneur, un peu comme `docker exec` !
- `CMD <command>` : permet de lancer une commande **au démarrage du conteneur**. Cette instruction ne doit être présente qu'une seule fois, et peut servir par exemple à démarrer notre application si nécessaire.
- `LABEL <key>:<value>` : permet d'ajouter des métadonnées à notre image, à titre informatif.
- `EXPOSE <port>` : informe Docker que notre image va écouter sur un port spécifique. Cette instruction ne redirige pas le port pour autant, cette instruction sert à documenter notre image.
- `ENV <key>=<value>` : permet de définir une variable d'environnement `<key>` et lui donner la valeur `<value>`.
- `COPY <source> <destination>` : permet de copier des fichiers de l'hôte à l'intérieur du conteneur.
- `WORKDIR /chemin/vers/workdir` : permet de se déplacer dans un dossier à l'intérieur du conteneur, utilisé souvent avant de lancer des commandes avec `RUN`.

### Créer un Dockerfile pour Laravel

Pour notre backend Laravel, on peux utiliser le `Dockerfile` suivant :

```dockerfile
# on part de l'image PHP 8.1 avec Apache
FROM php:8.1-apache

# En suivant les instructions de la doc sur le Dockerhub, on active l'extention PHP pdo_mysql
RUN docker-php-ext-install pdo_mysql

# Toujours en suivant la doc, on installe l'utilitaire pour dézipper & l'extention PHP zip
RUN apt update
RUN apt install -y libzip-dev zip
RUN docker-php-ext-install zip

# On se place dans le dossier /var/www/html
WORKDIR /var/www/html
# Et on copie le contenu du dossier courant (.) à l'intérieur de l'hôte (dossier back)
# dans le dossier courant à l'intérieur de l'image (dossier /var/www/html)
COPY . .

# Toujours en suivant la doc, on récupère Composer depuis une image Docker officielle
# et on on le copie dans notre image (à l'emplacement /usr/bin/composer)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# On lance la commande `cp .env.example .env` à l'intérieur de l'image
RUN cp .env.example .env
# Puis on lance la commande `composer install` pour installer les dépendances
RUN composer install --no-interaction --optimize-autoloader
# On lance la commande `php artisan key:generate`, nécessaire au bon fonctionnement de Laravel
RUN php artisan key:generate

# On ajoute les droits d'écriture à tout le monde sur le dossier /var/www/html/storage, pour que Laravel puisse écrire ses logs et son cache
RUN chmod -R a+w /var/www/html/storage

# On modifie le DocumentRoot du virtual host par défaut d'apache, toujours en suivant la doc
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Et pour finir on permet à Apache de lire les fichiers .htaccess et on active la réecriture d'URL
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride all/' /etc/apache2/apache2.conf
RUN a2enmod rewrite
```

💡 On doit placer ce fichier à l'intérieur de notre dossier `back`, il est déjà présent.

## Docker build

Une fois notre `Dockerfile` prêt, on va pouvoir demander à Docker de construire notre image. Pour cela, on utilise la commande `docker build` :

```bash
cd back
docker build -t pomodoro-backend-laravel .
```

💡 L'argument `-t pomodoro-backend-laravel` nous permet de **donner un nom à notre image**.

Observez le terminal : on peut y voir toutes les commandes qu'on a mis dans le `Dockerfile` être lancées une par une ! À la fin, Docker va nous indiquer :

```bash
Successfully built 1f5d64344316
Successfully tagged pomodoro-backend-laravel:latest
```

Ce message nous indique que notre image a été construite avec succès, et a été *taggée* (= nommée) `pomodoro-backend-laravel:latest`.

Par défaut, notre image a le tag `latest`, mais on peut spécifier le tag souhaité pour créer différentes versions de notre image (exemple : `docker build -t pomodoro-backend-laravel:experimental`).

On peut maintenant démarrer un conteneur à partir de notre nouvelle image :

```bash
docker run -dp 8080:80 pomodoro-backend-laravel
```

Ouvrez votre navigateur à l'adresse [http://localhost:8080](http://localhost:8080), vous devriez voir la documentation de notre API 🎉

Essayez ensuite l'URL [http://localhost:8080/api/tasks](http://localhost:8080/api/tasks). On a une erreur Laravel : `SQLSTATE[HY000] [2002] Connection refused`. Une petite idée d'où peut venir cette erreur ?

<details>
  <summary>Solution</summary>
  
  On a oublié de configurer notre base de données dans le fichier `.env` !

  > Mais on fait comment, on a pas installé MySQL ? Ni chargé notre fichier `DB.sql` !

  On verra ça par la suite 😉
  
</details>

## Docker push

Pour l'instant, l'image qu'on vient de créer (on dit aussi parfois **compiler**) n'est disponible que sur notre hôte. Comment faire si on veut la déployer sur un serveur de production ?

On va publier notre image sur le **DockerHub** !

On utilise pour cela la commande `docker push`, mais on doit au préalable se connecter :

```bash
docker login
```

Saisissez vos identifiants DockerHub quand ils vous sont demandés.

Rendez-vous ensuite sur le [DockerHub](https://hub.docker.com/), connectez-vous si nécessaire, et cliquez sur le bouton `Create repository`. Comme nom, saisissez `pomodoro-backend-laravel`, et choisissez la visibilité publique.

Pour indiquer à Docker quelle image il faut publier, on doit **tagger** notre image avec notre nom d'utilisateur :

```bash
docker image tag pomodoro-backend-laravel PSEUDO-DH/pomodoro-backend-laravel:latest
```

💡 N'oubliez pas de remplacer `PSEUDO-DH` par votre nom d'utilisateur DockerHub !

On peut ensuite publier notre image avec la commande :

```bash
docker push PSEUDO-DH/pomodoro-backend-laravel:latest
```

Une fois l'image publiée, on pourra l'utiliser sur n'importe quelle machine sur laquelle Docker est installé avec la commande :

```bash
docker run -dp 8080:80 PSEUDO-DH/pomodoro-backend-laravel
```

On s'occupera du déploiement sur notre serveur de production par la suite, mais avant, et si on regardait comment mettre en place la base de données ?

Pour cela, on va découvrir comment faire fonctionner des **applications multi-conteneurs avec Docker Compose** ! Ça se passe par [ici](./10-docker-compose.md).
