# Barhi Library website

A static, responsive website for Barhi Library. It is ready to deploy with GitHub Pages and has no build step or third-party JavaScript dependencies.

## Book inventory and recent donations

The initial website deliberately does not claim a book count or list donations that have not been verified. To connect the public inventory:

1. Create or choose a Google Sheet and add a tab named `Inventory`.
2. Add the column headers `Title`, `Quantity`, `Donor`, `Date`, and `Image URL`. Use one row per book title; `Quantity` is the number of copies. `Donor`, `Date`, and `Image URL` are optional. The count sums `Quantity` (or counts a row as one when quantity is blank). The latest three rows with a title or donor appear as recent contributions.
3. For donation pictures, upload each image to Google Drive, set its sharing access to **Anyone with the link — Viewer**, and paste its sharing URL in `Image URL`. The page recognizes standard Google Drive file-sharing links and displays the linked image.
4. Publish the `Inventory` sheet tab to the web as CSV, then add the published CSV URL to `inventoryCsvUrl` in `site-config.js`. Add the spreadsheet's regular sharing URL to `spreadsheetUrl` so visitors can open the sheet.
5. Update the sheet whenever books are added. The page reads the public CSV when it loads; it does not write to the sheet. Keep private information out of a publicly shared sheet.

Until a CSV URL is configured, the page displays that the inventory count is being verified, instead of showing an invented total. If the published CSV cannot be reached, the website shows an error message and keeps the verified-count placeholder.

## Preview

Open `index.html` in a browser. To test fetching the published sheet locally, serve the folder over HTTP rather than opening the file directly.

## Deploy with GitHub Pages

Create a GitHub repository, add these files to its root, and push the default branch. In the repository's **Settings → Pages**, select **Deploy from a branch**, choose the default branch and `/ (root)`, and save. No build command is needed.

The organization is described on the site as under development and not yet a registered NGO.
