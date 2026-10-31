# Express and Vite test app

Use the maintained Node 22 release line, at least 22.23.4, and its bundled npm.
The Node major stays aligned with the existing App Service staging workflow; no
hosted stack change is part of this refresh. Install both dependency trees with `npm ci` and `npm ci --prefix client`. Run `npm run dev` for the development server, or `npm run build` followed by `npm start` for the production server. Run `npm run lint --prefix client` to lint.

The client uses TypeScript 7 for compilation through an explicit package path. TypeScript 6 remains installed for typescript-eslint, whose supported API range currently excludes TypeScript 7. Update that compatibility package when upstream supports the newer API.
Use `npm run typecheck --prefix client`; bare `npx tsc` can resolve to TypeScript 6.

`npm audit` reports GHSA-g3hv-75wg-m249 in development-only minimatch 10 through ESLint and typescript-eslint. It can cause excessive work when processing attacker-controlled glob patterns. The app does not load these tools at runtime, and the project lint command uses repository configuration rather than user-supplied patterns. Both production dependency audits are clean. Upgrade when upstream accepts minimatch 11 or backports a fix; forcing an unsupported major would bypass upstream's compatibility range.

After building, `npm test` exercises health and SPA fallback from a hidden directory.
