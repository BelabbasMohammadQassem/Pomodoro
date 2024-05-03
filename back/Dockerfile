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