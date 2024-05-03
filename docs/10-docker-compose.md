# Docker Compose

Docker Compose permet de lancer des **applications multi-conteneurs**, c'est à dire de diviser notre application en plusieurs conteneurs et de les faire fonctionner ensemble !

On pourra par exemple avoir :

- un conteneur pour le frontend
- un conteneur pour le backend
- un conteneur pour la base de données

Pour utiliser Docker Compose, on doit **définir la liste des conteneurs dont nous allons avoir besoin dans un fichier de configuration au format `YAML`**.

Ce fichier de configuration doit s'appeler `compose.yaml` (c'est l'idéal !), mais Docker Compose tolère aussi `compose.yml`, ou `docker-compose.yaml` & `docker-compose.yml` pour des raisons de rétrocompatibilité.

Dans ce fichier, nous allons définir à minima :

- la version de la spécification Docker Compose utilisée (facultatif mais recommandé, seulement à titre d'information)
- les services de notre application (obligatoire)

Dans une application Docker Compose, **un service représente un composant de l'application**. Chaque service sera configuré avec une image Docker, et correspondra à un ou plusieurs conteneurs.

On aura 3 services dans notre cas, correspondant aux 3 conteneurs listés plus haut. Voici un exemple de configuration de nos services :

```yaml
version: "3"
services:
  frontend:
    image: httpd
  backend:
    image: PSEUDO-DH/pomodoro-backend-laravel
  db:
    image: mariadb
```

💡 On réutilise l'image `pomodoro-backend-laravel` compilée et publiée sur le DockerHub à l'étape précédente.

En l'état, ce fichier n'est pas fonctionnel ! Il faut qu'on rajoute notamment les redirections de port :

```yaml
version: "3"
services:
  frontend:
    image: httpd
    ports:
      - "8000:80"
  backend:
    image: PSEUDO-DH/pomodoro-backend-laravel
    ports:
      - "8080:80"
  db:
    image: mariadb
```

Il faut également qu'on ajoute le **bind mount** pour les fichiers du frontend :

```yaml
version: "3"
services:
  frontend:
    image: httpd
    ports:
      - "8000:80"
    volumes:
      - ./front:/usr/local/apache2/htdocs
  backend:
    image: PSEUDO-DH/pomodoro-backend-laravel
    ports:
      - "8080:80"
  db:
    image: mariadb
```

> Et pour la BDD ?

On va suivre la documentation sur le [dépôt DockerHub de l'image MariaDB](https://hub.docker.com/_/mariadb) !

## Configuration BDD

Comme de nombreuses images Docker, l'image officielle MariaDB utilise des **variables d'environnement** pour sa configuration.

On va devoir configurer les variables d'environnement suivantes :

```ini
MARIADB_ROOT_PASSWORD=password
MARIADB_DATABASE=db
```

Ces variables sont définies dans notre fichier `compose.yaml` de la sorte :

```yaml
version: "3"
services:
  frontend:
    image: httpd
    ports:
      - "8000:80"
    volumes:
      - ./front:/usr/local/apache2/htdocs
  backend:
    image: PSEUDO-DH/pomodoro-backend-laravel
    ports:
      - "8080:80"
  db:
    image: mariadb
    environment:
      - MARIADB_ROOT_PASSWORD=pomodoro
      - MARIADB_DATABASE=pomodoro
```

> Et comment on fait pour charger notre fichier DB.sql ?

En utilisant un volume Docker !

```yaml
version: "3"
services:
  frontend:
    image: httpd
    ports:
      - "8000:80"
    volumes:
      - ./front:/usr/local/apache2/htdocs
  backend:
    image: PSEUDO-DH/pomodoro-backend-laravel
    ports:
      - "8080:80"
  db:
    image: mariadb
    environment:
      - MARIADB_ROOT_PASSWORD=pomodoro
      - MARIADB_DATABASE=pomodoro
    volumes:
      - ./DB.sql:/docker-entrypoint-initdb.d/DB.sql
```

💡 Le nom du dossier `docker-entrypoint-initdb.d` dans lequel on monte notre fichier `DB.sql` est indiqué dans la documentation de l'image.

Il ne nous reste plus qu'à configurer les variables d'environnement de notre backend Laravel !

## Variables d'environnement Laravel

Laravel lit le fichier `.env` mais également les variables d'environnement du système ! On peut donc directement configurer la base de données utilisée par Laravel au niveau de notre fichier `compose.yaml` :

```yaml
version: "3"
services:
  frontend:
    image: httpd
    ports:
      - "8000:80"
    volumes:
      - ./front:/usr/local/apache2/htdocs
  backend:
    image: PSEUDO-DH/pomodoro-backend-laravel
    ports:
      - "8080:80"
    environment:
      - DB_HOST=db
      - DB_DATABASE=pomodoro
      - DB_USERNAME=root
      - DB_PASSWORD=pomodoro
  db:
    image: mariadb
    environment:
      - MARIADB_ROOT_PASSWORD=pomodoro
      - MARIADB_DATABASE=pomodoro
    volumes:
      - ./DB.sql:/docker-entrypoint-initdb.d/DB.sql
```

On peut voir qu'on utilise `db` comme valeur pour la variable d'environnement `DB_HOST` du backend. Cette variable permet de configurer le nom de domaine ou l'adresse IP du serveur de base de données, habituellement on y met `localhost`. La valeur `db` utilisée ici correspond au nom du service `db` définit dans notre fichier `compose.yaml`.

💡 Par défaut avec Docker Compose, tous les conteneurs correspondant à nos différents services seront sur un même réseau local, et chaque conteneur aura comme nom de domaine le nom du service.

## Démarrer l'application multi-conteneurs

Une fois notre fichier `compose.yaml` correctement configuré, on peut démarrer tous les conteneurs avec la commande :

```bash
docker compose up
```

💡 Comme pour la commande `docker run`, on ajoutera en général l'argument `-d` pour que les conteneurs soient démarrés en arrière-plan. Pour l'instant, nous n'utilisons pas cet argument pour pouvoir visualiser les messages d'erreur éventuels.

Rendez-vous à l'adresse [http://localhost:8000/](http://localhost:8000/). Vous devriez accéder au front, mais celui-ci affiche un message d'erreur `impossible de se connecter à l'API`.

Pour résoudre ce problème, modifiez le fichier `front/assets/js/settings.js` de la sorte :

```javascript
const environment = {
    baseAPIURL: "http://localhost:8080",
};
```

Essayez d'ajouter quelques tâches.

## Démarrer en arrière-plan

Pour stopper les conteneurs, utilisez le raccourci clavier `Ctrl+C`. Quand on utilise la commande `docker compose up`, les conteneurs sont lancés dans le terminal actuel (ce qui permet de regarder les logs en direct), mais dès qu'on va fermer ce terminal les conteneurs vont s'arrêter ...

On voudrait que les conteneurs **se lancent en arrière-plan**, comme avec l'argument `-d` de la commande `docker run` ! Ça tombe bien, Docker Compose dispose du même argument, permettant de lancer les conteneurs en arrière-plan, détactés du terminal courant :

```bash
docker compose up -d
```

On peut ensuite stopper tous les conteneurs d'un seul coup **en se plaçant dans notre dépôt** puis en lançant la commande :

```bash
docker compose down
```

## Persistance des données

Si ce n'est pas encore fait, stoppez les conteneurs avec le raccourci `Ctrl+C`, puis relancez-les avec la commande `docker compose up`. On peut constater que les tâches ajoutées sont toujours présentes !

> Mais les images sont immuables, comment les données peuvent-elles persister ?

Par défaut, l'image MariaDB créé un **volume Docker** : c'est un dossier de l'hôte monté à l'intérieur du conteneur, un peu comme les **bind mounts** (nous y reviendrons par la suite).

Essayez maintenant de stopper les conteneurs avec `docker compose down`, puis relancez-les.

> Les données ont disparu 😱

Ce coup-ci, la base de donnée a bel et bien été supprimée. Pour l'instant, on bosse sur notre environnement de dev, donc c'est pas très grave. Il faudra par contre absolument résoudre ce problème si on veut utiliser Docker pour la production !

Et c'est justement ce qu'on va voir maintenant : comment utiliser Docker pour mettre en place un environnement de production ! Ça se passe par [ici](./11-docker-production.md).
