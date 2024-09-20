# Use a minimal Debian-based image
FROM alpine:3.14


ENV POSTGRES_PASSWORD=admin

RUN apk update
RUN apk add postgresql
RUN mkdir /run/postgresql
RUN mkdir /run/postgresql/data
RUN postgres:postgres /run/postgresql/

RUN initdb -D /var/lib/postgresql/data


EXPOSE 5432
CMD ["postgres"]