# Pomodor'O

La méthode Pomodoro est une technique de gestion du temps développée par Francesco Cirillo à la fin des années 1980. Cette méthode se base sur l'usage d'un minuteur permettant de respecter des périodes de 25 minutes de travail. Ces périodes de travail sont séparées par des courtes pauses.

> Mais on est des devs nous ! Plutôt qu'utiliser un minuteur de cuisine, on pourrait pas se coder une petite appli ?

Ça tombe bien, l'appli en question est déjà codée. Il ne nous reste plus qu'à la **mettre en ligne**.

🧙 Suivez-le guide !

## Installer & configurer un environnement de production

Avant de pouvoir déployer notre application sur notre serveur, il faut qu'on installe quelques logiciels et qu'on les configure ... D'après-vous, **de quels logiciels va-t-on avoir besoin ?**

Pour installer & configurer ces logiciels, on suit les instructions listées sur une documentation. Celle qu'on va suivre aujourd'hui est au format Markdown dans ce dépôt.

Documentation : [Installer et configurer un environnement de production PHP](docs/01-install-logiciels.md).

## Déployer notre application

Une fois notre environnement de production correctement configuré, on peut déployer notre application.

> Mais, on fait comment ? Il faut juste copier les fichiers, non ? 🤔

Pas tout à fait ! Selon l'application à déployer, il faudra peut-être **installer des dépendances avec Composer**, **installer notre base de données**, et il faudra aussi **configurer Apache2** pour qu'il sache comment servir notre application. Sur des applications plus complexes, d'autres étapes peuvent être nécessaires.

- Documentation : [Déployer un site statique](docs/02-deploiement-site-statique.md) (frontend Pomodor'O)
- Documentation : [Mettre en place des virtualhosts Apache](docs/03-virtual-hosts.md)
- Documentation : [Déployer une application web complexe (Laravel)](docs/04-deploiement-app-laravel.md) (backend Pomodor'O)

## Aller plus loin : Docker

TODO
