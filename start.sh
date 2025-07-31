#!/bin/bash

# Start Django backend
cd /app/backend
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py runserver 127.0.0.1:8000 &

# Start nginx
nginx -g "daemon off;"