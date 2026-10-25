FROM php:8.2-apache

COPY . /var/www/html/

RUN mkdir -p /var/www/html/files /var/www/html/templates \
    && chown -R www-data:www-data /var/www/html/files /var/www/html/templates

EXPOSE 80
