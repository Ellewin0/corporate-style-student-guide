const $ = (id) => document.getElementById(id);
const state = { data: null };

const SAMPLE_URL = "sample-guide-data.json";

function setStatus(message, type = "") {
  const box = $("statusBox");
  box.textContent = message;
  box.className = `status-box ${type}`.trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value = "student-guide") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "student-guide";
}

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normaliseData(data) {
  const clone = structuredClone(data);
  clone.title = clone.title || "Untitled Student Guide";
  clone.subtitle = clone.subtitle || "Student Guide";
  clone.audience = clone.audience || "Students";
  clone.purpose = clone.purpose || "[Insert guide purpose]";
  clone.version = clone.version || "v1.0";
  clone.status = clone.status || "Draft";
  clone.owner = clone.owner || "[Insert owner]";
  clone.lastReviewed = clone.lastReviewed || "[Insert review date]";
  clone.sections = ensureArray(clone.sections);
  clone.helpfulTips = ensureArray(clone.helpfulTips);
  clone.troubleshooting = ensureArray(clone.troubleshooting);
  clone.faqs = ensureArray(clone.faqs);
  clone.whereToGetHelp = ensureArray(clone.whereToGetHelp);
  return clone;
}

function renderList(items, ordered = false, className = "") {
  const arr = ensureArray(items).filter(Boolean);
  if (!arr.length) return "";
  const tag = ordered ? "ol" : "ul";
  return `<${tag}${className ? ` class="${className}"` : ""}>${arr.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
}

function renderParagraphs(paragraphs) {
  return ensureArray(paragraphs).filter(Boolean).map(p => `<p>${escapeHtml(p)}</p>`).join("");
}

function renderTip(tip) {
  if (!tip) return "";
  return `<div class="tip-box"><strong>Tip:</strong> ${escapeHtml(tip)}</div>`;
}

function renderNote(note) {
  if (!note) return "";
  if (typeof note === "string") return `<div class="note-box"><strong>Note:</strong> ${escapeHtml(note)}</div>`;
  return `<div class="note-box"><strong>${escapeHtml(note.title || "Note")}:</strong> ${escapeHtml(note.text || "")}</div>`;
}

function renderWarning(warning) {
  if (!warning) return "";
  if (typeof warning === "string") return `<div class="warning-box"><strong>Important:</strong> ${escapeHtml(warning)}</div>`;
  return `<div class="warning-box"><strong>${escapeHtml(warning.title || "Important")}:</strong> ${escapeHtml(warning.text || "")}</div>`;
}

function renderImage(item) {
  const title = item.imagePlaceholder || item.imageTitle || item.screenshot || "Insert screenshot/image";
  const description = item.imageDescription || item.altText || "[Insert specific image description]";
  if (!item.imagePlaceholder && !item.imageDescription && !item.imageTitle && !item.screenshot) return "";
  return `<div class="image-box"><span class="placeholder-title">[Insert screenshot/image: ${escapeHtml(title)}]</span><p><strong>Description:</strong> ${escapeHtml(description)}</p></div>`;
}

function renderGenericTable(table) {
  if (!table || !Array.isArray(table.rows) || !table.rows.length) return "";
  const headers = table.headers || Object.keys(table.rows[0]);
  return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th scope="col">${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${table.rows.map(row => `<tr>${headers.map(h => `<td>${escapeHtml(row[h] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function renderSubsection(sub, index) {
  const titlePrefix = sub.number ? `${sub.number}. ` : "";
  const heading = sub.title || `Section ${index + 1}`;
  let html = `<div class="subsection-card"><h3>${escapeHtml(titlePrefix + heading)}</h3>`;
  html += renderParagraphs(sub.paragraphs || sub.body || sub.text);
  html += renderList(sub.bullets || sub.items, false);
  html += renderList(sub.steps || sub.instructions, true, "step-list");
  html += renderTip(sub.tip);
  ensureArray(sub.notes).forEach(note => html += renderNote(note));
  ensureArray(sub.warnings).forEach(warning => html += renderWarning(warning));
  html += renderImage(sub);
  html += `</div>`;
  if (sub.table) html += renderGenericTable(sub.table);
  return html;
}

function renderSections(data) {
  return data.sections.map((section, sectionIndex) => {
    const number = section.number || `${sectionIndex + 1}.0`;
    const title = section.title || "Guide section";
    const contents = ensureArray(section.subsections).map(renderSubsection).join("");
    const fallback = renderParagraphs(section.paragraphs || section.body || section.text);
    return `<section class="section-card" aria-labelledby="section-${sectionIndex}">
      <div class="section-heading">
        <h2 id="section-${sectionIndex}">${escapeHtml(number)} ${escapeHtml(title)}</h2>
        ${section.intro ? `<p class="section-intro">${escapeHtml(section.intro)}</p>` : ""}
      </div>
      ${fallback}
      ${contents}
    </section>`;
  }).join("");
}

function renderSimpleTable(title, rows, headers, mapFn) {
  const arr = ensureArray(rows).filter(Boolean);
  if (!arr.length) return "";
  return `<section class="section-card"><div class="section-heading"><h2>${escapeHtml(title)}</h2></div><div class="table-wrap"><table><thead><tr>${headers.map(h => `<th scope="col">${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${arr.map(item => `<tr>${mapFn(item).map(cell => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
}

function renderFaqs(faqs) {
  const arr = ensureArray(faqs).filter(Boolean);
  if (!arr.length) return "";
  return `<section class="section-card"><div class="section-heading"><h2>Frequently Asked Questions</h2></div><div class="faq-list">${arr.map(faq => `<div class="faq-item"><h3>Q. ${escapeHtml(faq.question || "[Insert question]")}</h3><p>A. ${escapeHtml(faq.answer || "[Insert answer]")}</p></div>`).join("")}</div></section>`;
}

function renderHelp(items) {
  const arr = ensureArray(items).filter(Boolean);
  if (!arr.length) return "";
  return `<section class="section-card"><div class="section-heading"><h2>Where to get help</h2></div><div class="help-list">${arr.map(item => `<div class="help-item">${escapeHtml(typeof item === "string" ? item : (item.label || item.text || "[Insert confirmed support contact]"))}</div>`).join("")}</div></section>`;
}

function buildContents(data) {
  if (data.contents && data.contents.length) return data.contents;
  const items = data.sections.map((section, index) => `${section.number || `${index + 1}.0`} ${section.title || "Guide section"}`);
  if (data.helpfulTips.length) items.push("Helpful Tips");
  if (data.troubleshooting.length) items.push("Troubleshooting");
  if (data.faqs.length) items.push("Frequently Asked Questions");
  if (data.whereToGetHelp.length) items.push("Where to get help");
  return items;
}

function renderGuide(rawData) {
  const data = normaliseData(rawData);
  state.data = data;
  const contents = buildContents(data);
  const guide = $("guidePreview");
  guide.innerHTML = `
    <header class="title-page">
      <div>
        <span class="document-label">${escapeHtml(data.documentType || "Student Guide")}</span>
        <h1>${escapeHtml(data.title)}</h1>
        <p class="subtitle">${escapeHtml(data.subtitle)}</p>
        <p class="purpose">${escapeHtml(data.purpose)}</p>
      </div>
      <div class="meta-grid" aria-label="Document details">
        <div class="meta-item"><span>Audience</span><strong>${escapeHtml(data.audience)}</strong></div>
        <div class="meta-item"><span>Status</span><strong>${escapeHtml(data.status)}</strong></div>
        <div class="meta-item"><span>Version</span><strong>${escapeHtml(data.version)}</strong></div>
        <div class="meta-item"><span>Owner</span><strong>${escapeHtml(data.owner)}</strong></div>
      </div>
    </header>
    <div class="guide-content">
      <section class="contents-card" aria-labelledby="contents-heading">
        <h2 id="contents-heading">Contents</h2>
        <ol>${contents.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
      </section>
      ${renderSections(data)}
      ${renderSimpleTable("Helpful Tips", data.helpfulTips, ["Tip", "Why it helps"], item => [item.tip || "", item.whyItHelps || item.description || ""])}
      ${renderSimpleTable("Troubleshooting", data.troubleshooting, ["Issue", "What to try"], item => [item.issue || "", item.whatToTry || item.solution || ""])}
      ${renderFaqs(data.faqs)}
      ${renderHelp(data.whereToGetHelp)}
      <section class="checklist-card" aria-labelledby="checklist-heading">
        <h2 id="checklist-heading">Accessibility and review checklist</h2>
        <ul>
          <li>Headings are structured in a logical order.</li>
          <li>Image placeholders include specific descriptions.</li>
          <li>Tables use clear headers and short text.</li>
          <li>Missing or unconfirmed information is marked with placeholders.</li>
          <li>Content is written in plain English and reviewed before publishing.</li>
        </ul>
      </section>
    </div>`;
  setStatus("Guide generated successfully. Review the preview, then export as needed.", "success");
  guide.focus();
}

function parseInput() {
  const text = $("jsonInput").value.trim();
  if (!text) throw new Error("Paste JSON into the input box first.");
  return JSON.parse(text);
}

async function loadSample() {
  try {
    const response = await fetch(SAMPLE_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load sample-guide-data.json");
    const data = await response.json();
    $("jsonInput").value = JSON.stringify(data, null, 2);
    renderGuide(data);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

function generateFromInput() {
  try { renderGuide(parseInput()); }
  catch (error) { setStatus(`JSON error: ${error.message}`, "error"); }
}

function downloadBlob(content, filename, mimeType) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getCurrentData() {
  if (state.data) return state.data;
  return normaliseData(parseInput());
}

function downloadJson() {
  try {
    const data = getCurrentData();
    downloadBlob(JSON.stringify(data, null, 2), `${slugify(data.title)}.json`, "application/json;charset=utf-8");
    setStatus("JSON downloaded.", "success");
  } catch (error) { setStatus(error.message, "error"); }
}

function standaloneHtml(data) {
  const rendered = $("guidePreview").innerHTML;
  const css = Array.from(document.styleSheets)
    .map(sheet => {
      try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join("\n"); }
      catch { return ""; }
    }).join("\n");
  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(data.title)}</title><style>${css}</style></head><body><main class="guide corporate-guide">${rendered}</main></body></html>`;
}

function downloadHtml() {
  try {
    const data = getCurrentData();
    if (!state.data) renderGuide(data);
    downloadBlob(standaloneHtml(data), `${slugify(data.title)}.html`, "text/html;charset=utf-8");
    setStatus("HTML guide downloaded.", "success");
  } catch (error) { setStatus(error.message, "error"); }
}

function downloadWordFriendlyHtml() {
  try {
    const data = getCurrentData();
    if (!state.data) renderGuide(data);
    const html = standaloneHtml(data).replace("<body>", "<body><p style='font-size:10pt;color:#555'>Open this HTML file in Microsoft Word, then save as .docx if you want an editable Word copy.</p>");
    downloadBlob(html, `${slugify(data.title)}-word-friendly.html`, "text/html;charset=utf-8");
    setStatus("Word-friendly HTML downloaded. Open it in Word and save as .docx if needed.", "success");
  } catch (error) { setStatus(error.message, "error"); }
}

function printGuide() {
  try {
    if (!state.data) renderGuide(parseInput());
    window.print();
  } catch (error) { setStatus(error.message, "error"); }
}

/* Minimal DOCX export: client-side OpenXML package with no external libraries. */
function xmlEscape(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function wP(text, style = "Normal") {
  const styleXml = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : "";
  return `<w:p>${styleXml}<w:r><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
}
function wBullet(text) { return wP(`• ${text}`, "Normal"); }
function wTable(rows) {
  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="8FA0B5"/><w:left w:val="single" w:sz="6" w:space="0" w:color="8FA0B5"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="8FA0B5"/><w:right w:val="single" w:sz="6" w:space="0" w:color="8FA0B5"/><w:insideH w:val="single" w:sz="6" w:space="0" w:color="CFD7E3"/><w:insideV w:val="single" w:sz="6" w:space="0" w:color="CFD7E3"/></w:tblBorders></w:tblPr>${rows.map((row, rowIndex) => `<w:tr>${row.map(cell => `<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/>${rowIndex === 0 ? `<w:shd w:fill="123C69"/>` : ""}</w:tcPr>${wP(cell, rowIndex === 0 ? "TableHead" : "Normal")}</w:tc>`).join("")}</w:tr>`).join("")}</w:tbl>`;
}
function wBox(label, text) { return wTable([[label, text]]); }

function docxDocumentXml(data) {
  let body = "";
  body += wP(data.title, "Title");
  body += wP(data.subtitle, "Subtitle");
  body += wP(data.purpose, "Normal");
  body += wP(`Audience: ${data.audience} | Status: ${data.status} | Version: ${data.version}`, "Normal");
  body += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
  body += wP("Contents", "Heading1");
  buildContents(data).forEach(item => body += wBullet(item));
  data.sections.forEach((section, i) => {
    body += wP(`${section.number || `${i+1}.0`} ${section.title || "Guide section"}`, "Heading1");
    if (section.intro) body += wP(section.intro);
    ensureArray(section.paragraphs || section.body || section.text).forEach(p => body += wP(p));
    ensureArray(section.subsections).forEach((sub, si) => {
      body += wP(`${sub.number ? `${sub.number}. ` : ""}${sub.title || `Section ${si+1}`}`, "Heading2");
      ensureArray(sub.paragraphs || sub.body || sub.text).forEach(p => body += wP(p));
      ensureArray(sub.bullets || sub.items).forEach(item => body += wBullet(item));
      ensureArray(sub.steps || sub.instructions).forEach((step, ix) => body += wP(`${ix+1}. ${step}`));
      if (sub.tip) body += wBox("Tip", sub.tip);
      if (sub.imagePlaceholder || sub.imageDescription) body += wBox(`[Insert screenshot/image: ${sub.imagePlaceholder || "Screenshot"}]`, `Description: ${sub.imageDescription || "[Insert specific image description]"}`);
    });
  });
  if (data.helpfulTips.length) body += wP("Helpful Tips", "Heading1") + wTable([["Tip", "Why it helps"], ...data.helpfulTips.map(x => [x.tip || "", x.whyItHelps || x.description || ""])]);
  if (data.troubleshooting.length) body += wP("Troubleshooting", "Heading1") + wTable([["Issue", "What to try"], ...data.troubleshooting.map(x => [x.issue || "", x.whatToTry || x.solution || ""])]);
  if (data.faqs.length) {
    body += wP("Frequently Asked Questions", "Heading1");
    data.faqs.forEach(f => { body += wP(`Q. ${f.question || "[Insert question]"}`, "Heading2"); body += wP(`A. ${f.answer || "[Insert answer]"}`); });
  }
  if (data.whereToGetHelp.length) {
    body += wP("Where to get help", "Heading1");
    data.whereToGetHelp.forEach(item => body += wBullet(typeof item === "string" ? item : item.label || item.text || "[Insert confirmed support contact]"));
  }
  body += `<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}</w:body></w:document>`;
}

function docxStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/><w:color w:val="172033"/></w:rPr><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="48"/><w:color w:val="123C69"/></w:rPr><w:pPr><w:spacing w:after="240"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="172033"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="123C69"/></w:rPr><w:pPr><w:spacing w:before="320" w:after="160"/><w:keepNext/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="172033"/></w:rPr><w:pPr><w:spacing w:before="220" w:after="120"/><w:keepNext/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="TableHead"><w:name w:val="Table Head"/><w:rPr><w:b/><w:color w:val="FFFFFF"/></w:rPr></w:style>
  </w:styles>`;
}

function crc32(str) {
  const bytes = new TextEncoder().encode(str);
  let crc = ~0;
  for (let b of bytes) {
    crc ^= b;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
  }
  return ~crc >>> 0;
}
function dosDateTime(date = new Date()) {
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime: dosTime & 0xffff, dosDate: dosDate & 0xffff };
}
function writeU16(arr, v) { arr.push(v & 255, (v >>> 8) & 255); }
function writeU32(arr, v) { arr.push(v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255); }
function makeZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const central = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime();
  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(file.content);
    const local = [];
    writeU32(local, 0x04034b50); writeU16(local, 20); writeU16(local, 0); writeU16(local, 0);
    writeU16(local, dosTime); writeU16(local, dosDate); writeU32(local, crc);
    writeU32(local, dataBytes.length); writeU32(local, dataBytes.length); writeU16(local, nameBytes.length); writeU16(local, 0);
    localParts.push(new Uint8Array([...local, ...nameBytes, ...dataBytes]));
    const c = [];
    writeU32(c, 0x02014b50); writeU16(c, 20); writeU16(c, 20); writeU16(c, 0); writeU16(c, 0);
    writeU16(c, dosTime); writeU16(c, dosDate); writeU32(c, crc);
    writeU32(c, dataBytes.length); writeU32(c, dataBytes.length); writeU16(c, nameBytes.length); writeU16(c, 0); writeU16(c, 0); writeU16(c, 0); writeU16(c, 0); writeU32(c, 0); writeU32(c, offset);
    central.push(new Uint8Array([...c, ...nameBytes]));
    offset += local.length + nameBytes.length + dataBytes.length;
  }
  const centralSize = central.reduce((n, p) => n + p.length, 0);
  const end = [];
  writeU32(end, 0x06054b50); writeU16(end, 0); writeU16(end, 0); writeU16(end, files.length); writeU16(end, files.length); writeU32(end, centralSize); writeU32(end, offset); writeU16(end, 0);
  return new Blob([...localParts, ...central, new Uint8Array(end)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

function downloadDocx() {
  try {
    const data = getCurrentData();
    const files = [
      { name: "[Content_Types].xml", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>` },
      { name: "_rels/.rels", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
      { name: "word/_rels/document.xml.rels", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>` },
      { name: "word/document.xml", content: docxDocumentXml(data) },
      { name: "word/styles.xml", content: docxStylesXml() }
    ];
    downloadBlob(makeZip(files), `${slugify(data.title)}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    setStatus("DOCX downloaded. Open in Word and run Accessibility Checker before publishing.", "success");
  } catch (error) { setStatus(error.message, "error"); }
}

$("loadSampleBtn").addEventListener("click", loadSample);
$("generateBtn").addEventListener("click", generateFromInput);
$("downloadJsonBtn").addEventListener("click", downloadJson);
$("downloadHtmlBtn").addEventListener("click", downloadHtml);
$("printBtn").addEventListener("click", printGuide);
$("downloadDocxBtn").addEventListener("click", downloadDocx);
$("downloadWordHtmlBtn").addEventListener("click", downloadWordFriendlyHtml);

loadSample();
