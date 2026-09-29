#!/bin/bash
# `prisma migrate dev` creates a temporary shadow database, so the application
# user needs CREATE/DROP rights beyond its own schema. Local development only.
set -e
mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<SQL
GRANT ALL PRIVILEGES ON *.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
SQL
