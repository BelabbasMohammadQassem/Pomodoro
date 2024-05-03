# Docker Exec

On l'a vu précédemment, les conteneurs sont en fait des sortes de machines virtuelles, qui exécutent un système d'exploitation Linux.

On va donc pouvoir **s'y connecter** pour lancer des commandes !

Pour cela, on utilise la commande `docker exec`.

Démarrons un nouveau conteneur PHP :

```bash
docker run -dp 8002:80 --name php-test php:8.2-apache
```

Une fois démarré, on peut utiliser la commande `docker exec` pour lancer une commande dans notre conteneur :

```bash
docker exec php-test bash -c "echo '<?php phpinfo();' > /var/www/html/index.php"
```

La commande `bash -c "echo '<?php phpinfo();' > /var/www/html/index.php"` lancée dans le conteneur `php-test` permet d'ajouter le contenu `<?php phpinfo();` dans le fichier `/var/www/html/index.php` du conteneur.

Ouvrez la page [http://localhost:8002](http://localhost:8002) dans votre navigateur, vous devriez voir la sortie de l'instruction PHP `phpinfo()` (qui permet d'avoir des informations sur notre installation de PHP).

Essayons de supprimer ce conteneur et de le relancer :

```bash
docker rm -f php-test
docker run -dp 8002:80 --name php-test php:8.2-apache
```

Si on actualise la page, on a une erreur `Forbidden` ... est-ce que vous savez d'où vient cette erreur ?

<details>
  <summary>Solution</summary>
  
  Une image Docker est **immuable**, on ne peut pas la modifier. La modification qu'on a effectué (créer un fichier avec l'instruction PHP `phpinfo()`) n'était donc que **temporaire**, elle existait seulement dans notre conteneur `php-test`, qui est une **instance de notre image**.

  💡 Si on avait seulement stoppé (`docker stop php-test`) puis relancé notre conteneur (`docker start php-test`), les modifications auraient été conservées puisqu'on utiliserait la **même instance (modifiée) de l'image**.
  
</details>

On verra par la suite comment faire **persister des données de nos conteneurs**, même après leur suppression !

Avant ça, voyons comment lancer des commandes plus complexes à l'intérieur de nos conteneurs.

## Ouvrir un terminal interactif

Pour lancer certaines commandes plus complexes dans un conteneur, ou un grand nombre de commandes à la suite, la syntaxe vue précédemment n'est pas adaptée.

On va plutôt **ouvrir un terminal interactif** sur notre conteneur (grâce à l'argument `-it` !), un peu comme si on s'y connectait en SSH !

```bash
docker exec -it php-test bash
```

Une fois cette commande lancée, le prompt va changer dans notre terminal ! Toutes les commandes qu'on va lancer seront lancées **dans le conteneur**.

Essayez différentes commandes, par exemple :

```bash
ls
pwd
echo "<?php phpinfo();" > index.php
ls
```

On peut par exemple installer Composer, avec les commandes utilisées hier :

```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php -r "if (hash_file('sha384', 'composer-setup.php') === 'e21205b207c3ff031906575712edab6f13eb0b361f2085f1f1237b7126d785e826a450292b6cfd1d64d92e6563bbde02') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"
php composer-setup.php
php -r "unlink('composer-setup.php');"
mv composer.phar /usr/local/bin/composer
```

💡 Seule la dernière commande diffère : pas besoin de `sudo`, on est déjà connecté en `root` dans le conteneur !

Dernière étape avant de pouvoir utiliser Composer, on doit installer un utilitaire pour dézipper dans notre conteneur ! Profitons-en également pour installer l'éditeur de texte `nano`. Lancez les commandes suivantes :

```bash
apt update
apt install -y zip nano
```

On peut maintenant utiliser Composer pour installer des dépendances :

```bash
composer require symfony/var-dumper
```

Si on lance la commande `ls`, on peut constater que le dossier `vendor` et les fichiers `composer.json` et `composer.lock` sont maintenant présents.

Modifions le contenu de notre fichier `index.php` avec `nano` :

```bash
nano index.php
```

Remplacez le contenu de ce fichier par les instructions ci-dessous :

```php
<?php

require 'vendor/autoload.php';

dump("Hello from symfony/var-dumper !");
```

Actualisez la page dans votre navigateur, vous devriez avoir voir le message affiché grâce à la dépendance `symfony/var-dumper`.

> C'est pas pratique, on va pas se connecter et lancer toutes ces commandes à chaque fois qu'on lance notre conteneur !

Pour éviter ça, on va créer nos propres images Docker personnalisées ! La suite dans le [prochain fichier](./09-dockerfile.md).
