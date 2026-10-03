#!/bin/sh
set -eu

site_config=/etc/nginx/site-config
certificate=/etc/letsencrypt/live/waliliens.com/fullchain.pem
private_key=/etc/letsencrypt/live/waliliens.com/privkey.pem

rm -f /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/waliliens.conf

if [ -s "$certificate" ] && [ -s "$private_key" ]; then
  cp "$site_config/waliliens.conf" /etc/nginx/conf.d/waliliens.conf
else
  cp "$site_config/bootstrap.conf" /etc/nginx/conf.d/waliliens.conf
fi
