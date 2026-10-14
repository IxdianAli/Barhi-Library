# Barhi Library website

A static, responsive website for Barhi Library. It is ready to deploy with GitHub Pages and has no build step or third-party JavaScript dependencies.

## Example inventory file, book count, and recent donations

Download [books-template.csv](./books-template.csv) and upload it to Google Drive, then open it with Google Sheets. It contains clearly marked sample data: **10 copies** across five sample book entries. The three most recent sample donations are dated 14, 13, and 12 October 2026. These are examples, not Barhi Library's verified inventory; replace them with the real book and donor details.

1. Create or choose a Google Sheet and add a tab named `Inventory`.
2. Keep these column headers: `Book Name`, `Author`, `Language`, `Donor Name`, `Edition`, `Quantity`, `Date`, and `Image URL`. The first five are the book-list details; quantity, date, and image URL are used for the copy total and donation updates. Enter one row per book/edition, and enter the number of copies in `Quantity`.
3. For donation pictures, upload each image to Google Drive, set its sharing access to **Anyone with the link — Viewer**, and paste its sharing URL in `Image URL`. The page recognizes standard Google Drive file-sharing links and displays the linked image.
4. The website adds up all `Quantity` values for the book count and shows up to three recent donations in descending `Date` order. Publish the `Inventory` sheet tab to the web as CSV, then add the published CSV URL to `inventoryCsvUrl` in `site-config.js`. Add the spreadsheet's regular sharing URL to `spreadsheetUrl` so visitors can open the sheet.
5. Replace every sample row before publishing or sharing the live inventory. The page reads the public CSV when it loads; it does not write to the sheet. Keep private information out of a publicly shared sheet.

Until a CSV URL is configured, the page displays that the inventory count is being verified, instead of showing an invented total. If the published CSV cannot be reached, the website shows an error message and keeps the verified-count placeholder.

## Preview

Open `index.html` in a browser. To test fetching the published sheet locally, serve the folder over HTTP rather than opening the file directly.

## Deploy with GitHub Pages

Create a GitHub repository, add these files to its root, and push the default branch. In the repository's **Settings → Pages**, select **Deploy from a branch**, choose the default branch and `/ (root)`, and save. No build command is needed.

The organization is described on the site as under development and not yet a registered NGO.
