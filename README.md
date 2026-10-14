# Barhi Library website

A static, responsive website for Barhi Library. It is ready to deploy with GitHub Pages and has no build step or third-party JavaScript dependencies.

## One Google spreadsheet with Books and Donations tabs

Use one Google Sheets spreadsheet with two tabs named `Books` and `Donations`. A CSV file is only one table and cannot contain multiple tabs. Upload [books-template.csv](./books-template.csv) to Drive, open it in Google Sheets, then rename its tab to `Books` and add a `Donations` tab.

1. In `Books`, use the columns `Book Name`, `Author`, `Language`, `Donor Name`, `Edition`, and `Quantity`. Use one row per title/edition; `Quantity` is the number of copies. The website totals this tab and displays a searchable book list.
2. In `Donations`, use the columns `Book Name`, `Donor Name`, `Date`, and `Image URL`. Add one row per donation. For pictures, upload the image to Drive, set access to **Anyone with the link — Viewer**, and paste its sharing URL.
3. Publish each tab separately as CSV: in Google Sheets choose **File → Share → Publish to web**, choose `Books` and `Comma-separated values (.csv)`, publish and copy the URL. Repeat for `Donations`.
4. In `site-config.js`, set `spreadsheetUrl` to the regular Google Sheets URL ending in `/edit`, `booksCsvUrl` to the published `Books` CSV URL, and `donationsCsvUrl` to the published `Donations` CSV URL. `spreadsheetUrl` is only the visitor-facing link to the workbook; it is not a CSV feed.
5. Replace sample data before publishing. Keep private information out of a publicly published spreadsheet.

Example configuration (replace each placeholder by copying the matching link from Google Sheets):

```js
spreadsheetUrl: "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit",
booksCsvUrl: "PUBLISHED_BOOKS_CSV_URL",
donationsCsvUrl: "PUBLISHED_DONATIONS_CSV_URL"
```

The `inventoryCsvUrl` setting remains supported for older single-tab inventories. A Google Drive file preview URL (such as `drive.google.com/file/d/.../view`) is not a published CSV feed and will not work as `booksCsvUrl`.

## Preview

Open `index.html` in a browser. To test fetching the published sheet locally, serve the folder over HTTP rather than opening the file directly.

## Deploy with GitHub Pages

Create a GitHub repository, add these files to its root, and push the default branch. In the repository's **Settings → Pages**, select **Deploy from a branch**, choose the default branch and `/ (root)`, and save. No build command is needed.

The organization is described on the site as under development and not yet a registered NGO.
