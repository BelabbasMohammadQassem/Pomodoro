# Orchestration de conteneurs

On l'a vu précedemment, Docker peut tout à fait être utilisé en production.

Cela-dit, il existe des problématiques auxquelles Docker Compose seul ne peut pas répondre (liste non exhaustive) :

- comment déployer automatiquement notre application ?
- comment s'assurer que les ressources matérielles de notre serveur sont suffisantes ?
- comment surveiller la santé de notre application ?
- comment déployer notre application sur un cluster de plusieurs machines ?

Pour adresser ces problématiques rencontrées en production, on utilise un **orchestrateur de conteneurs**. Le plus connu s'appelle **Kubernetes**. Docker propose également son propre orchestrateur, **Docker Swarm**.

Nous allons découvrir très rapidement le fonctionnement de Docker Swarm, un peu plus simple à appréhender que Kubernetes (mais moins puissant).

## Docker Swarm

Docker Swarm, comme Kubernetes, est pensé pour fonctionner sur un cluster (une grappe, un groupe) de plusieurs serveurs Linux.

Pour disposer rapidement (et gratuitement !) de plusieurs serveurs virtuels Linux, avec Docker pré-installé, on peut utiliser la plateforme [Play-With-Docker](https://labs.play-with-docker.com/).

⚠️ Ne lancez pas tous des instances en même temps, on va saturer la plateforme !

### Première instance : le "manager"

Un cluster Docker Swarm (aussi appelé un "swarm") doit obligatoirement comporter une machine dite "manager".

Sur une première instance Play-With-Docker (ou sur un premier serveur), on lance la commande :

```bash
docker swarm init --advertise-addr <MANAGER-IP>
```

En remplaçant `<MANAGER-IP>` par l'adresse IP de l'instance, par exemple :

```bash
docker swarm init --advertise-addr 192.168.0.13
```

Docker va nous indiquer que le swarm a été initialisé et que la machine courante en est maintenant le manager.

💡 Copiez la commande qui s'affiche, nous en aurons besoin sur les autres instances.

### Instances supplémentaires

Sur une deuxième instance PWD, lancez la commande copiée précédemment, elle doit ressembler à :

```bash
docker swarm join --token SWMTKN-1-0he1t0otgzn04gt0zbnm9xacvuh6d4770nbbn9j121t6ch00y7-3xjzu53ophujk8ulfbc4kkpa9 192.168.0.13:2377
```

⚠️ Inutile de copier/coller la commande ci-dessus, le token et l'adresse IP seront différents à chaque fois !

Si tout s'est bien passé, Docker va nous indiquer que la machine courante a rejoint le swarm en tant que **worker**.

### Surveiller l'état du cluster

Retournons sur le manager et lançons la commande :

```bash
docker node ls
```

On peut voir la liste des machines qui ont rejoint le cluster, leur état, la version du Docker Engine, etc.

La commande `docker info` donne également des informations sur l'état du cluster Docker Swarm.

### Service Docker

Maintenant que notre cluster est démarré, on va pouvoir lancer nos applications. La première façon de lancer une application sur le conteneur est d'utiliser un **service Docker**.

Un service est un peu comme un conteneur lancé avec `docker run` : les services permettent de démarrer un ou plusieurs conteneurs à partir d'une image Docker sur un cluster Docker Swarm.

Pour lancer 4 instances (4 "répliques") d'une image Docker sur le cluster, on utilise la commande :

```bash
docker service create --replicas 4 -p 80:80 bdelphin/simple_php-gethostname
```

On peut ensuite vérifier sur chaque machine combien de conteneurs Docker ont été démarrés avec la commande `docker ps`. Normalement, on devrait avoir 2 conteneurs par machine.

On peut voir les services en cours avec la commande `docker service ls`. 

Pour voir tous les conteneurs et leur status, on doit utiliser la commande `docker service ps <id_service>`.

On peut stopper l'exécution du service avec `docker service rm <id_service>`.

### Stack Docker

Un service Docker permet de lancer un ou plusieurs conteneurs à partir d'une image. Pour les applications multi-conteneurs Docker Compose, on va plutôt utiliser un **stack Docker**.

Pour créer/déployer un nouveau stack Docker, on utilise la commande :

```bash
docker stack deploy -c compose.yaml <nom_stack>
```

Testons avec notre appli Pomodor'O !

⚠️ Attention ! On ne peut pas utiliser l'instruction `build: ./back` que nous avions ajouté au fichier `compose.yaml` avec docker stack. Nous allons donc réutiliser pour cette démonstration l'image hébergée sur le DockerHub, en remplaçant cette instruction par `image: PSEUDODH/pomodoro-backend-laravel`

On doit d'abord envoyer notre appli sur le serveur. Pour éviter d'avoir à faire la configuration SSH pour git, on va utiliser SCP. Depuis notre machine :

```bash
cd ..
zip -r pomodoro.zip S08-PHP-Pomodor-O-PSEUDOGH
scp pomodoro.zip ip172-18-0-64-clni5lcsnmng008p6acg@direct.labs.play-with-docker.com:~/pomodoro.zip
```

Puis sur PWD :

```bash
unzip pomodoro.zip
cd S08-PHP-Pomodor-O-PSEUDOGH
```

Et enfin, pour démarrer le stack :

```bash
docker stack deploy -c compose.yaml pomorodo
```

La connexion à l'API ne fonctionne pas, vu qu'on a pas mis à jour la variable d'environnement `baseAPIURL` dans le fichier `settings.js`, mais on peut voir que le backend et le frontend sont opérationnels.

On peut même essayer de lancer des requêtes de test depuis Insomnia pour vérifier que tout est OK.

Quelques commandes pour monitorer l'état du Stack :

```bash
docker stack ls
docker stack ps pomodoro
docker stack services pomodoro
```

On peut ensuite augmenter le nombre de réplicas d'un service, pour supporter la montée en charge de notre application :

```bash
docker service scale pomodoro_backend=5
docker stack services pomodoro
docker stack ps pomodoro
```

## Portainer

Portainer est une interface graphique pour Docker. Elle permet de gérer facilement un cluster Docker Swarm.

Pour l'installer, on va suivre la documentation officielle :

```bash
curl -L https://downloads.portainer.io/ce2-19/portainer-agent-stack.yml -o portainer-agent-stack.yml
docker stack deploy -c portainer-agent-stack.yml portainer
```

On peut ensuite accéder à l'interface graphique sur le port 9000 de l'instance manager, créer un mot de passe et commencer à découvrir l'interface.

### Déployer une application avec Portainer

On peut également déployer une application avec Portainer. Pour cela, on va créer un nouveau stack, en important le fichier `compose.yaml` de notre application.

Pour simplifier les choses, on ne va déployer que le backend et la base de données, on va donc supprimer le service `frontend` du fichier `compose.yaml`. Pour la base de données, on va utiliser une image pré-construite, on va donc modifier le service `db` du fichier `compose.yaml`. Le `Dockerfile` ayant servi à la construction de cette image est le suivant :

```dockerfile
FROM mariadb
ENV MARIADB_ROOT_PASSWORD="pomodoroooooo"
ENV MARIADB_DATABASE="pomodoro"
COPY ./DB.sql /docker-entrypoint-initdb.d/
EXPOSE 3306
```

On charge également le fichier `.env` pour que les variables d'environnement soient bien prises en compte. Si la connexion à la BDD échoue, il faut spécifier les variables d'environnement directement dans le service depuis Portainer, après le démarrage du stack.

Voici le fichier `compose.yaml` final :

```yaml
version: "3"
services:
  backend:
    image: bdelphin/pomodoro-backend-laravel
    ports:
      - "8080:80"
  db:
    image: bdelphin/pomodoro-bdd-mariadb
    volumes:
      - pomodoro-db:/var/lib/mysql:Z
volumes:
  pomodoro-db:
```
