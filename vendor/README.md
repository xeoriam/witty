# Vendored browser dependency

- Package: `mammoth`
- Version: `1.13.0`
- File: `mammoth.browser.min.js`
- Source: `node_modules/mammoth/mammoth.browser.min.js`
- License: BSD-2-Clause, see `LICENSE.mammoth`
- Purpose: extract plain text from `.docx` files in the browser.

`build.mjs` prepends this UMD bundle to the generated `client.js`, so the
browser exposes `window.mammoth` without a runtime npm dependency.
