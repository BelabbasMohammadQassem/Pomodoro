# Docker : Commandes de base

Docker dispose d'un **très grand nombre de commandes** qui permettent de démarrer, stopper, supprimer des conteneurs, voir les conteneurs qui sont en cours d'exécution, de gérer les images disponibles localement, etc.

**Pas de panique !** Comme souvent, il est inutile d'essayer de retenir toutes ces commandes par coeur, on peut les retrouver rapidement sur Internet.

La documentation officielle liste toute les commandes disponibles : [https://docs.docker.com/engine/reference/commandline/cli/](https://docs.docker.com/engine/reference/commandline/cli/).

Ce fichier MarkDown va vous faire découvrir les commandes "principales" et fonctionnalités de base de Docker par la pratique.

## Démarrer un conteneur

**Un conteneur est l'instance d'une image**, donc pour démarrer un conteneur on va devoir préciser dans la commande **quelle image on veut utiliser**.

```bash
docker run hello-world
```

💡 Toutes les commandes Docker commençent par le mot-clé `docker`.

La commande `docker run` permet de **démarrer un conteneur avec l'image fournie en argument**, ici l'image officielle `hello-world`.

🔗 [Dépôt de l'image sur le DockerHub](https://hub.docker.com/_/hello-world)

Si on observe attentivement les premières lignes qui sont apparues dans la console, on peut voir le message d'information `Unable to find image 'hello-world:latest' locally`, suivi de `latest: Pulling from library/hello-world`.

Ce message nous indique que nous ne disposions pas d'une copie de cette image en local. Docker l'a donc téléchargée depuis le dépôt DockerHub.

Dans `hello-world:latest`, le mot clé `lastest` fait référence au **tag de l'image**. Ce **tag** est une sorte de **version de l'image**. Les différents tags disponibles sont listés sur le dépôt de l'image sur le DockerHub, et on peut choisir de démarrer sur un conteneur une image avec un tag spécifique avec la commande `docker run image:tag`.

Essayons de démarrer un conteneur avec une image un peu plus utile :

```bash
docker run httpd
```

`httpd` est le nom de l'image officielle du serveur web Apache.

Contrairement à l'image `hello-world`, quand on démarre un conteneur avec l'image d'Apache **le terminal reste bloqué** après l'affichage de quelques messages de debug.

> Comment ça se fait ? Ça y est, c'est déjà en panne ? 🤔

**C'est tout à fait normal**. L'image `hello-world` était prévue pour stopper le conteneur après l'affichage de quelques messages d'information. Or, un serveur Apache, c'est plutôt pensé pour fonctionner en permanence, le conteneur reste donc en fonctionnement dans notre terminal.

On va donc en général lancer nos conteneurs **en tâche de fond** ! Pour cela, on ajoute l'argument `-d` (detached) à la commande `docker run`.

Stoppez le conteneur avec le raccourci `Ctrl+C` puis relancez-le :

```bash
docker run -d httpd
```

Ce coup-ci, seule une suite de caractères alphanumérique est apparu dans le terminal, et on a récupéré directement notre prompt ensuite.

> Le conteneur s'est arrêté ? 🧐

Non ! Il tourne en **tâche de fond**, et on va voir par la suite comment interragir avec.

## Gestion des conteneurs démarrés

On peut visualiser les conteneurs actuellement démarrés avec la commande `docker ps`.

Cette commande nous retourne une sorte de tableau, avec plusieurs colonnes et une ligne par conteneur démarré :

```bash
CONTAINER ID   IMAGE     COMMAND              CREATED         STATUS         PORTS     NAMES
7f026a118c8b   httpd     "httpd-foreground"   5 minutes ago   Up 5 minutes   80/tcp    brave_torvalds
```

Parmi les informations disponibles, on retrouve pour chaque conteneur un **ID**, le nom de l'image utilisée, le status du conteneur et son heure de création, **les ports potentiellement exposés** (on y reviendra par la suite), et le **nom du conteneur**, ici `brave_torvalds`, attribué aléatoirement.

On peut stopper un conteneur avec la commande `docker stop`, suivie de l'**ID du conteneur** ou de **son nom** :

```bash
docker stop 7f026a118c8b
```

Pour éviter que Docker attribue un nom aléatoirement à nos conteneurs, on peut spécifier le nom désiré en ajoutant l'argument `--name` à la commande `docker run` :

```bash
docker run -d --name apache httpd
```

Si on relance `docker ps`, on peut constater que notre nouveau conteneur s'appelle bien `apache` :

```bash
CONTAINER ID   IMAGE     COMMAND              CREATED         STATUS         PORTS     NAMES
c81b65c84995   httpd     "httpd-foreground"   7 seconds ago   Up 6 seconds   80/tcp    apache
```

## Redirections de ports

On a donc démarré un conteneur avec l'image `httpd`, mais comment on fait pour **accéder à ce serveur** ?

La commande `docker ps` nous indique que le conteneur **expose son port 80** : on va donc pouvoir accéder à notre serveur par ce port ! Le problème c'est que par défaut, **Docker isole chaque conteneur dans un sous-réseau** : les conteneurs ont accès à internet, mais depuis internet ou notre ordinateur, impossible de communiquer avec les conteneurs.

Pour rendre le port 80 de notre conteneur accessible, nous allons devoir dire à Docker de faire **une redirection de port**. Pour cela, on ajoute l'argument `-p` à la commande `docker run`. On va donc stopper notre conteneur Apache et le relancer.

```bash
docker stop apache
```

Puis on essaye de le relancer avec l'argument `-p`, suivi de deux ports, séparés par le caractère `:`.

```bash
docker run -d -p 8000:80 --name apache httpd
```

💡 `-p 8000:80` permet de demander à Docker de **rediriger le port 8000 de l'ordinateur hôte vers le port 80 du conteneur**. Le port 8000 doit être disponible sur notre machine.

⚠️ Au moment de lancer cette dernière commande, vous devriez avoir une erreur indiquant : `docker: Error response from daemon: Conflict. The container name "/apache" is already in use`. En effet, on a stoppé notre conteneur nommé `apache`, mais on ne l'a pas définitivement supprimé. Docker nous indique donc que le nom est déjà pris ! On verra comment résoudre ce problème par la suite, pour l'instant utilisons le nom `apache2` :

```bash
docker run -d -p 8000:80 --name apache2 httpd
```

Ouvrez un navigateur est rendez-vous à l'adresse [http://localhost:8000/](http://localhost:8000/), vous devriez voir la page `It works!` par défaut du serveur Apache.

![it works!](images/it_works.png)

💡 Il est possible de "grouper" certains arguments de nos commandes Docker ! On regroupe souvent `-d` et `-p` ensemble, ce qui donne : `docker run -dp 8000:80 ...`.

## Supprimer un conteneur

Stoppons notre deuxième conteneur, normalement nommé `apache2` si vous avez bien suivi 😉

```bash
docker stop apache2
```

Pour voir les conteneurs stoppés, on peut rajouter l'argument `-a` à la commande `docker ps` :

```bash
docker ps -a
```

Vous devriez obtenir une liste avec tous les conteneurs que nous avons démarré depuis le début de nos tests :

```bash
CONTAINER ID   IMAGE         COMMAND                  CREATED          STATUS                          PORTS     NAMES
d67af45f265a   httpd         "httpd-foreground"       21 minutes ago   Exited (0) About a minute ago             apache2
c81b65c84995   httpd         "httpd-foreground"       24 minutes ago   Exited (0) 21 minutes ago                 apache
56d3fcacad6a   httpd         "httpd-foreground"       29 minutes ago   Exited (0) 29 minutes ago                 boring_curie
7f026a118c8b   httpd         "httpd-foreground"       40 minutes ago   Exited (0) 38 minutes ago                 brave_torvalds
66742f0b69e5   hello-world   "/hello"                 45 minutes ago   Exited (0) 43 minutes ago                 priceless_montalcini
```

Pour supprimer un conteneur, on utilise la commande `docker rm` suivie du nom ou de l'ID du conteneur.

```bash
docker rm apache
```

On peut même supprimer plusieurs conteneurs d'un seul coup :

```bash
docker rm apache2 boring_curie brave_torvalds priceless_montalcini
```

⚠️ Attention, les noms `boring_curie`, `brave_torvalds` et `priceless_montalcini` n'existent que sur ma machine ! Pensez à les remplacer par le nom de **vos** conteneurs !

On peut également **supprimer tous les conteneurs stoppés** avec la commande `docker container prune`.

On peut maintenant réutiliser le nom `apache` pour notre conteneur !

```bash
docker run -d -p 8000:80 --name apache httpd
```

> Et que ce passe-t-il si on essaye de supprimer un conteneur qui n'a pas été stoppé au préalable ?

```bash
docker rm apache
```

Si vous avez répondu "une erreur !", bravo, c'est bien ça : `Error response from daemon: You cannot remove a running container. Stop the container before attempting removal or force remove`.

Il faut stopper un conteneur avant de pouvoir le supprimer, ou alors on peut forcer la suppression en rajoutant l'argument `-f` à la commande :

```bash
docker rm -f apache
```

💡 Quand on veut stopper un conteneur, on ne prévoit pas forcément de le relancer ensuite. On utilise donc souvent la commande ci-dessus pour **stopper et supprimer un conteneur en une seule commande**.

## Relancer un conteneur stoppé

Redémarrons un conteneur `apache` et stoppons-le :

```bash
docker run -d -p 8000:80 --name apache httpd
docker stop apache
```

On peut maintenant le relancer avec la commande `docker start`, suivie de son ID ou de son nom :

```bash
docker start apache
```

## Gestion des images

On l'a vu, quand on lance un conteneur avec une image que l'on a jamais utilisé auparavant, celle-ci est téléchargée depuis le DockerHub. On peut ensuite démarrer plusieurs conteneurs à partir de cette image sans avoir à la télécharger à nouveau.

Pour voir les images stockées localement, on peut utiliser la commande `docker images` ou `docker image ls`:

```bash
REPOSITORY                              TAG               IMAGE ID       CREATED        SIZE
httpd                                   latest            75a48b16cd56   7 days ago     168MB
hello-world                             latest            9c7a54a9a43c   5 months ago   13.3kB
```

⚠️ De votre coté, les dates de création seront différentes.

Bien que plus légères que des disques dur de machines virtuelles, les images utilisées par nos conteneurs prennent de la place (presque 200Mo pour l'image d'Apache !), et il faut **penser à supprimer les images inutilisées pour en libérer**.

On peut supprimer une image avec la commande `docker image rm` suivi du nom de l'image à supprimer :

```bash
docker image rm httpd
```

⚠️ Cette commande devrait vous retourner un message d'erreur `Error response from daemon: conflict: unable to remove repository reference "httpd" (must force)`, c'est normal : l'image est actuellement utilisée par notre conteneur `apache`.

Il faut au préalable stopper **et supprimer** tous les conteneurs qui ont été démarrés à partir d'une image avant de pouvoir la supprimer.

On peut donc stopper et supprimer notre conteneur `apache` puis supprimer l'image `httpd` avec les commandes suivantes :

```bash
docker rm -f apache
docker image rm httpd
```

💡 On peut **supprimer toutes les images inutilisées** avec la commande `docker image prune -a`.

## La suite ?

On sait maintenant démarrer et arrêter des conteneurs et supprimer des images. On a pratiqué sur l'image `httpd`, qui embarque le server web Apache, mais on a juste vu la page par défaut !

Et si on essayait de faire fonctionner notre front dans un conteneur Docker ?

> Il faut qu'on utilise un Dockerfile pour construire notre propre image, c'est ça ?

On pourrait effectivement faire comme ça, mais on verra ça demain. En attendant, on va découvrir les `bind mounts`, "points de montage" en Français, qui vont nous permettre de "monter" un dossier contenant notre code à l'intérieur du conteneur !

Ça se passe par [ici](./07-docker-bind-mounts.md) !
