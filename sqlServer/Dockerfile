# Use a minimal Debian-based image
FROM mariadb:lts

ENV MARIADB_PASSWORD=passwd 
ENV MARIADB_ROOT_PASSWORD=passwd
ENV MARIADB_DATABASE=exmple-database
ENV MARIADB_USER=user 

COPY . /docker-entrypoint-initdb.d/

# Expose the default MariaDB port
EXPOSE 3306
#CMD ["mysqld"]