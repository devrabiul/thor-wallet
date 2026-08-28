# Deploying thor-wallet to the VPS

The site is a static bundle. nginx serves `dist/` off disk — there is no
application process, no port to proxy to, and nothing to supervise.

## Diagnosing the 502 that's up right now

nginx returns 502 only when it proxies to an upstream that isn't answering. A
vhost that serves files directly cannot produce one. So the current config has
a `proxy_pass` in it and the thing behind it is gone.

```sh
# What is the vhost actually doing? Look for proxy_pass.
sudo nginx -T | grep -A20 'thor-wallet'

# Which upstream refused the connection — names the port directly.
sudo tail -50 /var/log/nginx/error.log

# Is anything listening on the dev-server ports at all?
sudo ss -ltnp | grep -E '4173|5173|3000'
```

`npm run preview` is `vite preview` (port 4173) and `npm run dev` is `vite`
(port 5173). Either one behind nginx explains the outage exactly: they are dev
servers, they exit when the SSH session that launched them closes, and nothing
restarts them. Replacing the vhost with `deploy/nginx.conf` removes the proxy,
so this failure mode is gone rather than merely restarted.

## First deploy

```sh
sudo mkdir -p /var/www/thor-wallet
sudo chown -R "$USER":"$USER" /var/www/thor-wallet
git clone https://github.com/devrabiul/thor-wallet.git /var/www/thor-wallet
cd /var/www/thor-wallet
npm ci
npm run build          # writes dist/ — it is gitignored, so always build here

sudo cp deploy/nginx.conf /etc/nginx/sites-available/thor-wallet
sudo ln -sf /etc/nginx/sites-available/thor-wallet /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # only if it's shadowing this host
sudo nginx -t && sudo systemctl reload nginx
```

nginx runs as `www-data` and needs `+x` on every directory down to `dist/`. If
you get 403s instead of the app, that's why:

```sh
sudo chmod o+x /var/www /var/www/thor-wallet
```

## Subsequent deploys

```sh
cd /var/www/thor-wallet && git pull && npm ci && npm run build
```

No nginx reload needed — it picks up the new files immediately. `index.html` is
served `no-store` and everything in `assets/` is content-hashed, so browsers
get the new build on next load without a stale-cache window.

## Verifying it's actually fixed

Test the origin directly, bypassing Cloudflare, from the VPS itself:

```sh
curl -I -H 'Host: thor-wallet.nextcodes.top' http://127.0.0.1/
curl -I -H 'Host: thor-wallet.nextcodes.top' http://127.0.0.1/login   # SPA fallback → 200
```

Both should be `200`. If the origin is healthy but Cloudflare still shows 502,
purge the Cloudflare cache — but the edge does not cache error responses by
default, so that is unlikely to be needed.

## Cloudflare TLS

The DNS record is proxied (orange cloud), so Cloudflare terminates TLS and the
vhost above only listens on port 80. That works as-is if the zone's SSL mode is
**Flexible**, but Flexible leaves Cloudflare→origin traffic unencrypted over
the public internet.

The better setup is an **Origin Certificate** (Cloudflare dashboard → SSL/TLS →
Origin Server → Create Certificate, 15-year validity), installed on the VPS,
with the zone set to **Full (strict)**. Add to the vhost:

```nginx
listen 443 ssl;
listen [::]:443 ssl;
http2 on;
ssl_certificate     /etc/ssl/cloudflare/thor-wallet.pem;
ssl_certificate_key /etc/ssl/cloudflare/thor-wallet.key;
```

The standalone `http2 on;` directive needs nginx 1.25.1+. On older builds drop
that line and use `listen 443 ssl http2;` instead — check with `nginx -v`.

Don't use certbot here — Let's Encrypt's HTTP-01 challenge has to reach the
origin, and the orange cloud intercepts it.

## Note on `public/.htaccess`

That file is the Apache SPA fallback and is inert under nginx. It's harmless —
it just gets copied into `dist/` on every build, and the `location ~ /\.` block
above blocks requests for it. The nginx equivalent is the `try_files` line in
`deploy/nginx.conf`. Keep both only if you still deploy this anywhere Apache
serves it; otherwise `public/.htaccess` can be deleted.
