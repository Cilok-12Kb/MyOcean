// src/utils/chatMessageHelpers.js

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function isTableLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.split("|").length > 2;
}

export function isSeparatorRow(cells) {
  return cells.every((c) => /^:?-+:?$/.test(c.trim()));
}

export function parseTableBlock(tableLines) {
  const rows = tableLines.map((line) =>
    line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim())
  );
  const dataRows = rows.filter((cells) => !isSeparatorRow(cells));
  if (dataRows.length === 0) return null;

  const [header, ...body] = dataRows;
  return { header, body };
}

// Pecah teks bot jadi blok teks biasa & blok tabel markdown, supaya tabel
// bisa dirender sebagai <table> sungguhan, bukan teks "| a | b |" mentah.
export function parseMessageBlocks(text) {
  const lines = (text ?? "").split("\n");
  const blocks = [];
  let buffer = [];

  const flushText = () => {
    if (buffer.length) {
      blocks.push({ type: "text", content: buffer.join("\n") });
      buffer = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    if (isTableLine(lines[i])) {
      const tableLines = [];
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      flushText();
      const table = parseTableBlock(tableLines);
      if (table) blocks.push({ type: "table", table });
    } else {
      buffer.push(lines[i]);
      i++;
    }
  }
  flushText();

  return blocks;
}