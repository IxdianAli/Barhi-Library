const config = window.BARHI_LIBRARY_CONFIG || {};
let inventoryRecords = [];

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field.trim());
      field = "";
    } else if (character === "\n" || character === "\r") {
      row.push(field.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else {
      field += character;
    }
  }
  row.push(field.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim().toLowerCase());
  return rows.slice(1).map((values) => Object.fromEntries(
    headers.map((header, index) => [header, values[index] || ""])
  ));
}

function getField(record, ...names) {
  const key = Object.keys(record).find((candidate) => names.includes(candidate.trim().toLowerCase()));
  return key ? String(record[key]).trim() : "";
}

function parseInventoryDate(value) {
  if (!value) return null;
  const isoDate = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoDate) {
    const [, year, month, day] = isoDate;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return parsed.getFullYear() === Number(year)
      && parsed.getMonth() === Number(month) - 1
      && parsed.getDate() === Number(day) ? parsed : null;
  }

  const numericDate = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (numericDate) {
    const [, first, second, year] = numericDate;
    const firstNumber = Number(first);
    const secondNumber = Number(second);
    const day = firstNumber > 12 ? firstNumber : secondNumber > 12 ? secondNumber : firstNumber;
    const month = firstNumber > 12 ? secondNumber : secondNumber > 12 ? firstNumber : secondNumber;
    const parsed = new Date(Number(year), month - 1, day);
    return parsed.getFullYear() === Number(year)
      && parsed.getMonth() === month - 1
      && parsed.getDate() === day ? parsed : null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getImageUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    const driveFile = url.pathname.match(/\/file\/d\/([^/]+)/);
    const driveId = driveFile ? driveFile[1] : url.hostname === "drive.google.com" ? url.searchParams.get("id") : null;
    return driveId ? `https://drive.google.com/uc?export=view&id=${encodeURIComponent(driveId)}` : url.href;
  } catch {
    return "";
  }
}

function renderDonations(records) {
  const list = document.querySelector("#donation-list");
  const recent = records
    .filter((record) => getField(record, "book name", "title", "book title", "book") || getField(record, "donor name", "donor", "donated by"))
    .sort((first, second) => {
      const firstDate = parseInventoryDate(getField(first, "date", "donation date"))?.getTime() || 0;
      const secondDate = parseInventoryDate(getField(second, "date", "donation date"))?.getTime() || 0;
      return secondDate - firstDate;
    })
    .slice(0, 3);

  if (!recent.length) {
    list.innerHTML = '<p class="empty-state">Our latest book donations will appear here once they’re added to the inventory sheet.</p>';
    return;
  }

  list.innerHTML = recent.map((record) => {
    const title = getField(record, "book name", "title", "book title", "book") || "Book donation";
    const donor = getField(record, "donor name", "donor", "donated by") || "Community donor";
    const parsedDate = parseInventoryDate(getField(record, "date", "donation date"));
    const image = getImageUrl(getField(record, "image url", "image", "photo url", "photo"));
    const date = parsedDate
      ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(parsedDate)
      : "Recently added";
    const thumbnail = image
      ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
      : '<span class="donation-placeholder" aria-hidden="true">✳</span>';
    return `<article class="donation-item">${thumbnail}<div><h4>${escapeHtml(title)}</h4><p>Donated by ${escapeHtml(donor)}</p></div><time>${escapeHtml(date)}</time></article>`;
  }).join("");
}

function renderBookList(records) {
  const search = document.querySelector("#book-search").value.trim().toLowerCase();
  const books = records.filter((record) => getField(record, "book name", "title", "book title", "book"));
  const matchingBooks = books.filter((record) => [
    getField(record, "book name", "title", "book title", "book"),
    getField(record, "author"),
    getField(record, "language"),
    getField(record, "donor name", "donor", "donated by"),
    getField(record, "edition")
  ].join(" ").toLowerCase().includes(search));
  const tableWrap = document.querySelector("#book-table-wrap");
  const emptyMessage = document.querySelector("#book-list-empty");
  const resultsCount = document.querySelector("#book-results-count");
  const body = document.querySelector("#book-list-body");

  tableWrap.hidden = false;
  resultsCount.textContent = `Showing ${matchingBooks.length} of ${books.length} books`;
  if (matchingBooks.length === 0) {
    body.replaceChildren();
    emptyMessage.hidden = false;
    emptyMessage.textContent = books.length
      ? "No books match your search. Try another title, author, language or donor."
      : "No book entries found. Add books to the Books tab to see them here.";
    return;
  }

  emptyMessage.hidden = true;
  body.innerHTML = matchingBooks.map((record) => {
    const values = [
      getField(record, "book name", "title", "book title", "book"),
      getField(record, "author"),
      getField(record, "language"),
      getField(record, "donor name", "donor", "donated by"),
      getField(record, "edition")
    ];
    return `<tr>${values.map((value) => `<td>${escapeHtml(value || "—")}</td>`).join("")}</tr>`;
  }).join("");
}

function isDriveFilePreviewUrl(value) {
  try {
    const url = new URL(value);
    return url.hostname === "drive.google.com" && /^\/file\/d\/[^/]+\/view/.test(url.pathname);
  } catch {
    return false;
  }
}

function setInventoryError(message) {
  const error = document.querySelector("#sheet-error");
  error.hidden = false;
  error.textContent = message;
}

async function fetchSheetCsv(url, tabName) {
  if (isDriveFilePreviewUrl(url)) {
    throw new Error(`The ${tabName} URL is a Google Drive file preview, not a published CSV. Open the spreadsheet in Google Sheets and publish the ${tabName} tab as CSV.`);
  }

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${tabName} CSV request failed (${response.status}).`);
  const text = await response.text();
  if (/^\s*(<!doctype\s+html|<html|<head|<body)/i.test(text)) {
    throw new Error(`The ${tabName} URL returned a web page instead of CSV. Publish the ${tabName} tab as CSV and use its published link.`);
  }

  const records = parseCsv(text);
  if (records.length === 0) throw new Error(`The published ${tabName} tab is empty or is not a valid CSV.`);
  return records;
}

async function loadInventory() {
  const count = document.querySelector("#book-count");
  const countStatus = document.querySelector("#count-status");
  const sheetLink = document.querySelector("#sheet-link");

  if (config.spreadsheetUrl) sheetLink.href = config.spreadsheetUrl;
  const booksUrl = config.booksCsvUrl || config.inventoryCsvUrl;
  if (!booksUrl) {
    setInventoryError("Connect the published Books CSV URL in site-config.js to display the current book count and catalogue.");
    return;
  }

  try {
    const records = await fetchSheetCsv(booksUrl, "Books");
    const quantities = records.map((record) => {
      const raw = getField(record, "quantity", "copies", "count");
      if (!raw) return 1;
      const value = Number(raw.replace(/,/g, ""));
      if (!Number.isFinite(value) || value < 0) {
        const title = getField(record, "book name", "title", "book title", "book") || "Untitled book";
        throw new Error(`Invalid quantity for "${title}" in the inventory sheet.`);
      }
      return value;
    });
    const total = quantities.reduce((sum, quantity) => sum + quantity, 0);

    count.textContent = new Intl.NumberFormat("en-IN").format(total);
    countStatus.textContent = `Copies across ${records.length} inventory entries`;
    inventoryRecords = records;
    renderBookList(records);

    if (config.donationsCsvUrl) {
      try {
        renderDonations(await fetchSheetCsv(config.donationsCsvUrl, "Donations"));
      } catch (cause) {
        renderDonations([]);
        setInventoryError(`${cause.message} The book count and catalogue loaded successfully.`);
        console.error("Unable to load Barhi Library donations:", cause);
      }
    } else {
      renderDonations(records);
    }
  } catch (cause) {
    setInventoryError(`${cause.message} Check that the tab is published to the web as CSV and the link is correct.`);
    console.error("Unable to load Barhi Library inventory:", cause);
  }
}

document.querySelector("#book-search").addEventListener("input", () => renderBookList(inventoryRecords));

const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  document.querySelector(".site-nav").classList.toggle("is-open", !isOpen);
});

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    document.querySelector(".site-nav").classList.remove("is-open");
  });
});

loadInventory();
