# Thor Wallet

Vite + React 19 SPA (React Router 7, Tailwind 4 + daisyUI). Private repo. Runs
at http://thor-wallet.nextcodes.top — a VPS with nginx, behind Cloudflare. It
was previously on GitHub Pages at https://devrabiul.github.io/thor-wallet/ and
no longer is.

## Rules

### On "git push" — lint must be clean first

When asked to push, do this in order and do not skip ahead:

1. Run `npm run lint`.
2. If it reports errors, fix them, then re-run until it exits clean.
3. Run `npm run build` to confirm the fixes didn't break the bundle.
4. Only then `git push`.

Fix the lint errors properly — remove the dead code, correct the hook. Do not
silence them with `eslint-disable` comments, `--fix`-and-hope, or by loosening
`eslint.config.js`. If a rule genuinely should not apply, say so and ask before
changing the config.

If a lint error can't be fixed without a behavioral change to the app, stop and
ask rather than pushing a workaround.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server at `/` |
| `npm run lint` | ESLint — must pass before any push |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the built output at `/` |

## CI

`.github/workflows/ci.yml` runs lint + build on pushes to `main` and `v1.0` and
on PRs. It does not publish — a green run just means the bundle compiles.

There is no GitHub Pages deployment. `base` is `/` everywhere, so the app
assumes it is served from the domain root; if it ever gets hosted under a
subpath again, set `base` in `vite.config.js` rather than hardcoding a prefix
anywhere. The router's `basename` is `import.meta.env.BASE_URL`, so it follows
`base` automatically — keep in-app links as plain `to="/route"`.

## Hosting

nginx on a VPS serves `dist/` off disk. See `deploy/` for the vhost and the
deploy steps. CI does not deploy — builds happen on the server via `npm run
build`, since `dist/` is gitignored.

Never put `vite preview` or `vite dev` behind nginx as an upstream. They are
dev servers, they exit with the shell that started them, and a `proxy_pass` to
a dead one is what caused a production 502 outage. Serving files directly means
there is no upstream to fail.

## Auth

`src/lib/auth.js` is a client-side demo gate — credentials ship in the bundle
and it protects nothing. Don't present it as real authentication.
