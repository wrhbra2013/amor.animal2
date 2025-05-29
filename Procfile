web: web: gunicorn amor.animal2.wsgi:application --bind 0.0.0.0:$PORT
celery: celery -A amor.animal2 worker -l info
celerybeat: celery -A amor.animal2 beat -l info
