# Article Master Barcode Logger

A static, mobile-friendly web app for scanning product barcodes, collecting carton attributes, storing the session locally, and exporting the result as CSV.

## Final access link

After this repository is pushed to GitHub and GitHub Pages is enabled, the live app will be available at:

```text
https://<your-github-username>.github.io/Article-Master/
```

Replace `<your-github-username>` with the GitHub account or organization that owns the public repository.

> This working copy does not currently have a GitHub remote configured, so the exact public URL cannot be generated from the local repo alone. Add a remote with `git remote add origin https://github.com/<your-github-username>/Article-Master.git`, push the branch, and enable Pages or run the included Pages workflow.

## Files included in this repository

- `index.html` — main application markup and mobile UI structure.
- `styles.css` — responsive styling, dark-mode support, scanner frame, buttons, forms, table, and toast styles.
- `app.js` — barcode scanning, manual fallback, localStorage persistence, table rendering, clear controls, and CSV export logic.
- `.github/workflows/pages.yml` — GitHub Actions deployment workflow for GitHub Pages.

## Features

- Uses the browser `BarcodeDetector` API with `getUserMedia` camera access when available.
- Captures Case Length, Case Width, Case Height, Weight in kilograms, and EA/Box for every barcode.
- Stores records in `localStorage` on the device so accidental refreshes do not lose session data.
- Exports the current dataset as a CSV file directly from the browser.
- Includes manual barcode entry fallback for browsers without barcode scanning support.

## GitHub Pages deployment

1. Push this repository to GitHub:

   ```bash
   git remote add origin https://github.com/<your-github-username>/Article-Master.git
   git push -u origin work
   ```

2. Open **Settings > Pages** in the GitHub repository.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Open the **Actions** tab and run **Deploy static site to GitHub Pages** manually, or merge/push this branch to `main` or `master` to deploy automatically.
5. Open the generated Pages URL, which should match `https://<your-github-username>.github.io/Article-Master/`.

> Camera APIs require HTTPS or localhost. GitHub Pages serves over HTTPS, so camera access works on supported mobile browsers.
