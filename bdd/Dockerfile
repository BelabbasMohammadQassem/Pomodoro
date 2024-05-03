FROM mariadb
ENV MARIADB_ROOT_PASSWORD="pomodoroooooo"
ENV MARIADB_DATABASE="pomodoro"
COPY ./DB.sql /docker-entrypoint-initdb.d/

EXPOSE 3306
#CMD ["mysqld"]