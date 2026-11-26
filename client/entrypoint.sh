#!/bin/sh
set -e

assets=/usr/share/nginx/html/assets
envsubst < "$assets/env.template.json" > "$assets/env.json"

exec nginx -g 'daemon off;'