# VirtualHosts Apache

On vient de voir comment déployer en production un site statique, composé exclusivement de code HTML, CSS et JS.

Sauf que notre appli, elle n'est pas composée que d'un front-end ! Il faut aussi qu'on déploie le back-end PHP !

> Mais on peut déployer plusieurs appli, ou il nous faut un deuxième serveur ?

On *pourrait* utiliser un deuxième serveur, c'est d'ailleurs souvent le cas dans le monde pro. Mais on peut aussi **héberger plusieurs applications sur un même serveur**, et pour ça on utilise ... les **Virtual Hosts** Apache !

💡 il existe un équivalent sur d'autres logiciels serveurs web (comme Nginx par exemple).

## VirtualHosts Apache : c'est quoi ?

Les VirtualHosts Apache permettent d'héberger plusieurs sites web sur un seul et même serveur.

> Mais si on a plusieurs sites sur le même serveur, comment on va accéder à un site en particulier ?

Pour accéder à un site spécifique sur un serveur donné, il y a plusieurs possibilités :

- **Par un port spécifique à chaque site**, si on a qu'un seul nom de domaine, exemple :
  - monsupersite.fr ➡️ accéde à un premier site sur le port 80 ou 443 (si HTTPS)
  - monsupersite.fr:8080 ➡️ accéde à un deuxième site sur le port 8080
  - monsupersite.fr:1234 ➡️ accéde à un troisième site sur le port 1234
  - etc.
- **Par un nom de domaine spécifique à chaque site**, exemple :
  - monsupersite.fr ➡️ accéde à un premier site
  - blog.monsupersite.fr ➡️ accéde à un deuxième site
  - sitedetest.fr ➡️ accéde à un troisième site
  - etc.

Dans le cas des nom de domaines, je rappelle que **ces différents sites peuvent tout à fait être hébergés sur un même serveur !**

> Oui mais du coup, comment on associe un port ou un nom de domaine à un site spécifique sur notre serveur ?

Grâce aux VirtualHosts 💪 **Un VirtualHost correspondra à un site hébergé sur notre serveur.**

## DocumentRoot

Chaque site hébergé sur notre serveur est stocké dans un dossier spécifique, par exemple :

- Notre blog oNews fait en S01 est stocké dans `/var/www/html/S01/S01-onews-.../`
- L'application Adminer est dans le dossier `/var/www/html/adminer/`
- etc.

Pour rappel, un serveur est un ordinateur comme les autres 😉 Nos sites sont donc dans des dossiers stockés sur cet ordinateur ! (et généralement ils sont dans /var/www/html/...)

**Le chemin absolu du dossier (depuis la racine `/`) contenant chacun de nos sites s'appelle le DocumentRoot**, ce dossier sera la racine (root) de notre site, le point d'entrée de nos visiteurs. D'ailleurs, pour les sites en MVC (petite piqûre de rappel 💉), il faudra faire attention à faire pointer le DocumentRoot sur le sous-dossier public 😉

C'est tout ce qu'il y a à savoir sur le DocumentRoot, c'est le dossier racine que l'on veut exposer à nos visiteurs pour un site spécifique sur notre serveur !

> Ok, c'est bien beau tout ça, mais on sait toujours pas comment ça fonctionne un virtual host !

## La configuration des VHosts : sites-available & sites-enabled, a2ensite & a2dissite

Nous allons configurer chaque VirtualHost de notre serveur (pour rappel, un site = un VirtualHost) grâce à un fichier `nom_site.conf`.

Ce fichier devra être placé dans le dossier `/etc/apache2/sites-available/`.

Retournez sur votre terminal (celui de la VM Serveur Kourou, sur laquelle vous êtes connecté en SSH), et tapez les commandes suivantes :

```bash
cd /etc/apache2/sites-available/
ls
```

La commande `ls` affiche les différents sites disponibles (available) sur votre serveur. Par défaut, il y en a deux, `000-default.conf` et `default-ssl.conf` qui peuvent servir d'exemple.

Le virtual host `000-default.conf` on l'utilise depuis le début du socle sans le savoir : c'est lui qui nous permettait d'accéder à tous nos projets dans le dossier `/var/www/html` depuis [http://localhost](http://localhost) sur notre téléporteur.

C'est parti, on va créer ensemble un nouveau virtual host pour notre front-end 😁

```bash
sudo nano pomodoro-front.conf
```

`nano` est un **éditeur de texte en ligne de commande** : il nous permet de créer un nouveau fichier et de modifier son contenu directement depuis le terminal.

Copiez-collez les instructions suivantes dans l'éditeur de texte nano : (rappel, pour coller utiliser Ctrl+Shift+V !)

```bash
<VirtualHost *:80>
    # Adresse (nom de domaine) sur laquelle on va aller pour accéder à l'application
    # ATTENTION, bien remplacer {{PSEUDO-GITHUB}} par votre pseudo GitHub !
    ServerName {{PSEUDO-GITHUB}}-server.eddi.cloud
    # Chemin de l'application (racine du serveur web)
    # ATTENTION, bien remplacer {{PSEUDO-GITHUB}} par votre pseudo GitHub !
    DocumentRoot /var/www/html/S08-PHP-Pomodor-O-{{PSEUDO-GITHUB}}/front

    # Emplacement logs Apache
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

⚠️ IMPORTANT : n'oubliez pas de remplacer `{{PSEUDO-GITHUB}}` par votre pseudo Github.

Une fois que c'est fait, vous pouvez appuyer sur `Ctrl+X` pour enregistrer les modifications, puis sur la touche `O` ou `Y` pour valider le nom du fichier, et enfin sur la touche Entrée pour fermer nano.

💡 Cette configuration nous permet d'**associer un dossier (DocumentRoot) à un nom de domaine (ServerName)**. Le nom de domaine utilisé doit avoir été configuré au préalable pour *pointer vers notre serveur* via un enregistrement DNS, se référer à la documentation de votre hébergeur pour cela.

Vous pourriez par exemple acheter le nom de domaine `prenomnom.fr`, et héberger différents sites sur un même serveur avec les sous-domaines suivants :

- blog.prenomnom.fr ➡️ dossier `/var/www/html/blog/`
- portfolio.prenomnom.fr ➡️ dossier `/var/www/html/portfolio/`
- cv.prenomnom.fr ➡️ dossier `/var/www/html/cv/`
- etc.

Pour vérifier que tout a bien fonctionné, lancez la commande suivante :

```bash
cat /etc/apache2/sites-available/pomodoro-front.conf
```

Vous devriez voir le même contenu que nous avons copié/collé s'afficher ! (à ceci près que `{{PSEUDO-GITHUB}}` a été remplacé par votre pseudo Github)

Nous allons maintenant activer ce nouveau site ! Pour cela, lancez les commandes suivantes dans votre terminal :

```bash
sudo a2ensite pomodoro-front
sudo systemctl reload apache2
```

Si tout s'est bien passé, notre site/VirtualHost est maintenant activé.

Pour vérifier, lancez la commande suivante :

```bash
cat /etc/apache2/sites-enabled/pomodoro-front.conf
```

Vous devriez voir à nouveau le contenu de notre VirtualHost.

Regardez attentivement la commande que l'on vient de taper : on a demandé à notre terminal de nous afficher un fichier dans le dossier `/etc/apache2/sites-enabled/`, or on avait pourtant mis notre VirtualHost dans `sites-available` ? 🤔

C'est justement ce que fait la commande `a2ensite`, elle copie notre fichier dans le dossier sites-enabled d'Apache, qui contient les VirtualHosts actifs.

Pour désactiver notre site (retirer le fichier du dossier sites-enabled), nous pouvons utiliser la commande `a2dissite`. On va d'ailleurs s'en servir pour désactiver le virtual host par défaut, dont nous n'avons plus besoin :

```bash
sudo a2dissite 000-default
sudo systemctl reload apache2
```

La commande `sudo systemctl reload apache2` permet de recharger Apache afin qu'il prenne en compte nos modifications.

⚠️ Problème : adminer ne fonctionne plus ...

## Un virtualhost pour Adminer

Adminer est un site à part entière, donc on va devoir lui créer son propre virtual host.

Lancez la commande suivante :

```bash
sudo nano /etc/apache2/sites-available/adminer.conf
```

Puis collez le contenu suivant dans ce fichier :

```bash
<VirtualHost *:80>
    # Adresse (nom de domaine) sur laquelle on va aller pour accéder à l'application
    # ATTENTION, bien remplacer {{PSEUDO-GITHUB}} par votre pseudo GitHub !
    ServerName adminer.{{PSEUDO-GITHUB}}-server.eddi.cloud
    # Chemin de l'application (racine du serveur web)
    DocumentRoot /var/www/html/adminer

    # Emplacement logs Apache
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

⚠️ IMPORTANT : n'oubliez pas de remplacer `{{PSEUDO-GITHUB}}` par votre pseudo Github.

Appuyez sur `Ctrl+X` pour enregistrer les modifications, puis sur la touche `O` ou `Y` pour valider le nom du fichier, et enfin sur la touche Entrée pour fermer nano.

Activez le nouveau virtual host et relancez Apache avec les commandes :

```bash
sudo a2ensite adminer
sudo systemctl reload apache2
```

Rendez-vous sur [http://adminer.PSEUDOGH-server.eddi.cloud/](http://adminer.PSEUDOGH-server.eddi.cloud/), vous devriez accéder à Adminer ! 🎉

## Un virtual host pour le back-end

Tant qu'on y est, créeons également le virtual host pour notre back-end Laravel.

Lancez la commande suivante :

```bash
sudo nano /etc/apache2/sites-available/pomodoro-back.conf
```

Puis collez le contenu suivant dans ce fichier :

```bash
<VirtualHost *:80>
    # Adresse (nom de domaine) sur laquelle on va aller pour accéder à l'application
    # ATTENTION, bien remplacer {{PSEUDO-GITHUB}} par votre pseudo GitHub !
    ServerName backend.{{PSEUDO-GITHUB}}-server.eddi.cloud
    # Chemin de l'application (racine du serveur web)
    # ATTENTION, bien remplacer {{PSEUDO-GITHUB}} par votre pseudo GitHub !
    DocumentRoot /var/www/html/S08-PHP-Pomodor-O-{{PSEUDO-GITHUB}}/back/public

    # Emplacement logs Apache
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

Activez le nouveau virtual host et relancez Apache avec les commandes :

```bash
sudo a2ensite pomodoro-back
sudo systemctl reload apache2
```

Si vous ouvrez [http://backend.PSEUDOGH-server.eddi.cloud/](http://backend.PSEUDOGH-server.eddi.cloud/) dans votre navigateur, vous arrivez sur une page blanche ... et c'est normal ! Il nous reste quelques étapes pour mettre un projet Laravel en production, et ça se passe par [ici](./04-deploiement-app-laravel.md).
