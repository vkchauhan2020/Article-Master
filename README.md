# Article Master Barcode Logger

A static, mobile-friendly web app for scanning product barcodes, collecting carton attributes, storing the session locally, and exporting the result as CSV.

## Final access link

After this repository is pushed to GitHub and GitHub Pages is enabled, the live app will be available at:

```text
https://vkchauhan2020.github.io/Article-Master/
```

This is the final public URL once the repo is pushed and GitHub Pages finishes deploying.

> This working copy does not currently have a GitHub remote configured, so the exact public URL cannot be generated from the local repo alone. Add a remote with `git remote add origin https://github.com/vkchauhan2020/Article-Master.git`, push the branch, and enable Pages or run the included Pages workflow.

## Files included in this repository

- `index.html` — main application markup and mobile UI structure.
- `styles.css` — responsive styling, dark-mode support, scanner frame, buttons, forms, table, and toast styles.
- `app.js` — barcode scanning, manual fallback, localStorage persistence, table rendering, clear controls, and CSV export logic.
- `.github/workflows/pages.yml` — GitHub Actions deployment workflow for GitHub Pages.

## Start using the app

1. Open `https://vkchauhan2020.github.io/Article-Master/` on your phone.
2. Tap **Start scanning** and allow camera permission.
3. Point the rear camera at a barcode. If camera scanning does not start, open **Camera unavailable? Enter barcode manually** and type the code.
4. Enter Case Length, Case Width, Case Height, Weight in kilograms, and EA/Box.
5. Tap **Save item**. Repeat scanning and saving for each product.
6. Tap **Download CSV** to save the collected data to your phone.

## Local test before deployment

From the repository folder, run:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/` in a desktop browser to confirm the page loads. Camera scanning on phones must be tested from the HTTPS GitHub Pages URL because mobile browsers block camera access on ordinary HTTP pages.

## Features

- Uses the browser `BarcodeDetector` API with `getUserMedia` camera access when available.
- Captures Case Length, Case Width, Case Height, Weight in kilograms, and EA/Box for every barcode.
- Stores records in `localStorage` on the device so accidental refreshes do not lose session data.
- Exports the current dataset as a CSV file directly from the browser.
- Includes manual barcode entry fallback for browsers without barcode scanning support.

## GitHub Pages deployment

1. Push this repository to GitHub:

   ```bash
   git remote add origin https://github.com/vkchauhan2020/Article-Master.git
   git push -u origin work
   ```

2. Open **Settings > Pages** in the GitHub repository.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. Open the **Actions** tab and run **Deploy static site to GitHub Pages** manually, or push any branch containing this workflow to deploy automatically.
5. Open the generated Pages URL, which should match `https://vkchauhan2020.github.io/Article-Master/`.

> Camera APIs require HTTPS or localhost. GitHub Pages serves over HTTPS, so camera access works on supported mobile browsers.
