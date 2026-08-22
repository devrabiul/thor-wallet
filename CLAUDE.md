# Thor Wallet

Vite + React 19 SPA (React Router 7, Tailwind 4 + daisyUI), deployed to GitHub
Pages at https://devrabiul.github.io/thor-wallet/.

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
| `npm run preview` | Serves the built output at `/thor-wallet/` |

## Deploy

`.github/workflows/deploy.yml` runs on pushes to `main` and `v1.0`; PRs run
lint + build only.

**Only `main` can actually publish.** The `github-pages` environment has a
deployment-branch rule that rejects everything else, so a push to `v1.0` builds
fine and then fails at the Deploy job with "Branch v1.0 is not allowed to deploy
to github-pages due to environment protection rules." Shipping from `v1.0` means
merging it into `main` — that's what PR #1 did.

CI gates on lint — a lint error fails the job and nothing deploys.

### Subpath gotchas

Pages serves this from `/thor-wallet/`, not the domain root:

- `vite.config.js` sets `base` for build/preview; dev stays at `/`.
- The router's `basename` is `import.meta.env.BASE_URL`. Keep in-app links as
  plain `to="/route"` — never hardcode `/thor-wallet/`.
- The build emits `404.html` (an `index.html` copy) and `.nojekyll`. Pages has
  no SPA rewrite, so `404.html` is what keeps deep-link refreshes working.

## Auth

`src/lib/auth.js` is a client-side demo gate — credentials ship in the bundle
and it protects nothing. Don't present it as real authentication.
