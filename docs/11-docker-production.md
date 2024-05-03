# Docker : environnement de production

Maintenant qu'on a découvert Docker et vu qu'on pouvait s'en servir pour monter un environnement de développement, se pose la question : peut-on utiliser Docker en production ?

Et la réponse est oui !

Dans ce fichier Markdown nous allons installer Docker sur notre VM Serveur Kourou, puis faire quelques ajustements à notre fichier `compose.yaml`.

## Installation de Docker

Si vous n'avez pas encore installé Docker sur votre VM Serveur Kourou, suivez les instructions du fichier [05-docker-install.md](./05-docker-install.md) !

## compose.yaml pour la production

Nous allons avoir plusieurs ajustements à faire dans notre fichier `compose.yaml` pour qu'il soit adapté à une utilisation en production :

- ce fichier contient des informations sensibles, notamment le mot de passe de la base de données. Or, il est commité sur notre dépôt Github ...
- on utilise une image hébergée sur le DockerHub pour le backend : c'est peut-être quelque-chose qu'on voudra éviter.
- à l'inverse, le code du frontend n'est pas hébergé sur DockerHub mais monté dans le conteneur via un bind mount. Ceci implique que nous devrons livrer le code du frontend avec le fichier `compose.yaml`.
- persistance des données : actuellement, quand on stoppe et qu'on relance les conteneurs, la base de données est réinitialisée ! 😱
- redémarrer les conteneurs en cas d'erreur : actuellement, si un conteneur plante, il faut le relancer à la main !

### Informations sensibles

Pour éviter de mettre nos mots de passe directement dans le fichier `compose.yaml`, on peut créer un fichier `.env` ! Ce fichier doit être à la racine du dépôt, et voici son contenu :

```ini
DB_HOST=db
DB_DATABASE=pomodoro
DB_USERNAME=root
DB_PASSWORD=pomodoro

MARIADB_ROOT_PASSWORD=pomodoro
MARIADB_DATABASE=pomodoro
```

Créeons également un fichier `.env.example` qui servira d'exemple.

Nous pouvons maintenant modifier notre fichier `compose.yaml` pour qu'il lise le mot de passe depuis le fichier `.env` !

```yaml
version: "3"
services:
  frontend:
    image: httpd
    ports:
      - "8000:80"
    volumes:
      - type: bind
        source: ./front
        target: /usr/local/apache2/htdocs
  backend:
    image: bdelphin/pomodoro-backend-laravel
    ports:
      - "8080:80"
    env_file:
      - .env
  db:
    image: mariadb
    volumes:
      - ./DB.sql:/docker-entrypoint-initdb.d/DB.sql
    env_file:
      - .env
```

Il ne reste plus qu'à ajouter un fichier `.gitignore` à la racine du dépôt avec comme contenu :

```bash
.env
```

### Se passer de DockerHub

Actuellement, l'image du backend est publiée sur le Dockerhub. Les registres d'images tel que le Dockerhub sont très pratiques (ils nous permettent d'héberger nos images Docker personnalisées), mais dans certains cas on peut vouloir éviter de publier notre code / nos images sur internet.

Bonne nouvelle, on peut facilement se passer du Dockerhub !

Vu qu'on ne pourra plus héberger d'image compilée en local, on va **compiler nos images directement sur le serveur de production, au lancement des conteneurs** !

Pour cela, on peut utiliser l'instruction `build` dans notre fichier `compose.yaml` :

```yaml
version: "3"
services:
  frontend:
    image: httpd
    ports:
      - "8000:80"
    volumes:
      - type: bind
        source: ./front
        target: /usr/local/apache2/htdocs
  backend:
    build: ./back
    ports:
      - "8080:80"
    env_file:
      - .env
  db:
    image: mariadb
    volumes:
      - ./DB.sql:/docker-entrypoint-initdb.d/DB.sql
    env_file:
      - .env
```

⚠️ Cette solution impose de livrer le code du backend (dans le dossier `back`) en même temps que le fichier `compose.yaml`.

### Persistance des données

Une fois notre application en production, les données de la base de données deviennent très précieuses : on ne peut pas se permettre de les perdre !

Or actuellement, quand on stoppe (avec la commande `docker compose down`) et qu'on relance les conteneurs, les tâches qu'on a ajouté ont disparu 😱 Ça veut donc dire qu'à la moindre interruption du serveur (panne de courant, crash du Docker Engine, etc.) on perdra toutes les données de notre application !

C'est tout à fait normal : les images Docker étant des fichiers immuables, on ne peut pas stocker notre BDD à l'intérieur de l'image, les données qu'on y ajoute n'existent actuellement que dans le conteneur lancé, l'instance de cette image.

Pour éviter ça, on va devoir **monter un volume Docker** à l'intérieur du conteneur. Un volume fonctionne un peu comme un **bind mount**, la différence est qu'on ne choisit par quel dossier sur notre hôte on souhaite monter dans le conteneur, c'est Docker qui gère !

![difference volumes bind mounts](https://docs.docker.com/storage/images/types-of-mounts-volume.webp)

Cette image provient de la [documentation officielle Docker](https://docs.docker.com/storage/volumes/) : on peut y voir que comme pour les bind mounts, les volumes seront stockés dans le système de fichiers de l'ordinateur hôte (notre PC, ou le serveur si on est en production). Les volumes seront stockés dans un dossier spécifique (nommé `Docker area` sur ce schéma), contraiement aux bind mounts (pour lesquels on spécifie quel dossier on veut monter).

Avec la commande `docker run`, on utilise l'argument `-v` pour monter un volume dans un conteneur :

```bash
docker run -v mon-super-volume:/chemin/dans/le/conteneur image:tag
```

Au lancement, si le volume n'existe pas encore, il sera automatiquement créé par Docker. On peut également créer les volumes en amont avec la commande `docker volume create mon-super-volume`.

Dans notre cas, on utilise Docker Compose. La syntaxe est très similaire à celle utilisée pour les **bind mounts** :

```yaml
version: "3"
services:
  frontend:
    image: httpd
    ports:
      - "8000:80"
    volumes:
      - type: bind
        source: ./front
        target: /usr/local/apache2/htdocs
  backend:
    build: ./back
    ports:
      - "8080:80"
    env_file:
      - .env
  db:
    image: mariadb
    volumes:
      - ./DB.sql:/docker-entrypoint-initdb.d/DB.sql
      - pomodoro-db:/var/lib/mysql:Z
    env_file:
      - .env
volumes:
  pomodoro-db:
```

Avec ce `compose.yaml`, notre BDD sera stockée sur l'hôte dans un volume Docker nommé `pomodoro-db`.

⚠️ Il faut également ajouter 2 lignes supplémentaire à la fichier du fichier `compose.yaml` :

```yaml
...
volumes:
  pomodoro-db:
```

💡 Si on avait besoin de plusieurs volumes Docker, ils devraient tous être listés sous la section `volumes:` à la fin du `compose.yaml`.

Essayez de relancer les conteneurs, d'ajouter des tâches, puis de stopper & relancer à nouveau les conteneurs. Si vous n'avez pas fait d'erreur, les données devraient maintenant persister 🎉

Pour lister les volumes Docker existants, lancez la commande :

```bash
docker volume ls
```

Vous devriez avoir au moins deux volumes :

```bash
DRIVER    VOLUME NAME
local     b14a4b287bee0d5e257c1dab7d1ac8fde1d98f7a61f32610cf341a9717477007
local     s08-php-pomodor-o_pomodoro-db
```

Le premier volume a un nom aléatoirement attribué par Docker, et correspond au volume créé par défaut par MariaDB. Le deuxième volume est celui qu'on vient de créer.

À retenir : les volumes Docker sont stockés **sur le système de fichiers de l'hôte**, ce qui permet donc de faire persister notre BDD même après l'arrêt / la suppression d'un conteneur.

### Relancer automatiquement les conteneurs

En production, la **disponibilité** de notre application est très importante : on veut qu'elle soit accessible par nos visiteurs à n'importe quel moment, on vise une disponibilité de 100% (24h/24, 7jours/7).

Nos conteneurs peuvent parfois rencontrer un bug, et se stopper. Dans notre configuration actuelle, il faudrait qu'on se connecte au serveur pour relancer le conteneur stoppé à la main : pas génial.

Pour éviter ce problème, on peut ajouter l'instruction `restart: always` sur tous nos services :

```yaml
version: "3"
services:
  frontend:
    image: httpd
    restart: always
    ports:
      - "8000:80"
    volumes:
      - type: bind
        source: ./front
        target: /usr/local/apache2/htdocs
  backend:
    build: ./back
    restart: always
    ports:
      - "8080:80"
    env_file:
      - .env
  db:
    image: mariadb
    restart: always
    volumes:
      - ./DB.sql:/docker-entrypoint-initdb.d/DB.sql
      - pomodoro-db:/var/lib/mysql:Z
    env_file:
      - .env
volumes:
  pomodoro-db:
```

De cette façon, en cas de crash d'un conteneur, il sera automatiquement relancé.

## Aller plus loin : orchestration de conteneurs & CI/CD

On vient de le voir, avec quelques ajustements à notre fichier `compose.yaml`, Docker Compose est parfaitement adapté à une utilisation en production.

Cela-dit, il existe des problématiques auxquelles Docker seul ne peut pas répondre (liste non exhaustive) :

- comment déployer automatiquement notre application ?
- comment s'assurer que les ressources matérielles de notre serveur sont suffisantes ?
- comment surveiller la santé de notre application ?

Et surtout ... comment déployer notre application sur un cluster de plusieurs machines ?

Il est donc fréquent d'utiliser un **orchestrateur de conteneurs**, logiciel spécialement pensé pour adresser ces problématiques rencontrées en production.

On en parle un peu dans le [dernier fichier Markdown](./12-orchestration.md), et on ouvre également sur les pratiques DevOps : l'intégration continue (CI) et le déploiement continu (CD).
