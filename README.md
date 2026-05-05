# Corporate Student Guide Formatter

A static GitHub Pages tool for turning structured guide JSON into a corporate-style student guide.

The formatter is designed for broader student-facing resources that may be published to an intranet, document library, student support page, or staff resource hub.

## What this repository includes

| File | Purpose |
|---|---|
| `index.html` | Webpage structure and interactive editor/preview layout |
| `styles.css` | Corporate visual style using an Aptos-first font stack, grey title banner, green accent colour, borders, typography, tables, callouts and print/PDF rules |
| `app.js` | Reads guide JSON, renders the guide, and exports HTML, PDF, DOCX and Word-friendly HTML |
| `sample-guide-data.json` | Public-safe sample JSON for testing the formatter |
| `guide-data.json` | Default guide JSON; replace this with new guide content if you want a default guide |
| `.nojekyll` | Helps GitHub Pages serve the static files cleanly |
| `README.md` | Setup and update instructions |

## How to publish with GitHub Pages

1. Create a new public repository.
2. Upload all files in this folder to the root of the repository.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/(root)`.
6. Save and wait for the GitHub Pages URL.

## How to use the formatter

1. Open the GitHub Pages site.
2. Select **Load sample** or paste JSON from your Copilot agent.
3. Select **Generate guide**.
4. Review the preview.
5. Export using one of the available options:
   - **Download HTML** for the most faithful accessible web version.
   - **Print / Save PDF** for a polished printable version.
   - **Download DOCX** for an editable Word draft.
   - **Word-friendly HTML** for a visual file that can be opened in Word and saved as DOCX.

## Recommended Copilot agent prompt

Use this prompt when asking an agent to create guide JSON:

```text
Create structured JSON for the Corporate Student Guide Formatter.

Output valid JSON only. Do not include Markdown, commentary, code fences, or explanations.

The JSON will be pasted into a browser-based guide formatter that applies the corporate visual style, including an Aptos-first font stack, grey title banner, green accent colour, rounded green heading boxes, layout, borders, typography, tables, callouts, screenshot placeholders and print/PDF formatting.

Use only the process information I provide. Do not invent policy, support contacts, eligibility rules, service commitments, or technical steps. Use clear placeholders where information needs confirmation.

Write in Australian English, plain English, inclusive wording, and a student-friendly tone.

Use this schema:
{
  "title": "",
  "subtitle": "Student Guide",
  "documentType": "Student Guide",
  "audience": "Students",
  "purpose": "",
  "version": "v1.0",
  "status": "Draft",
  "owner": "[Insert owner]",
  "lastReviewed": "[Insert review date]",
  "brandName": "[Optional brand mark text]",
  "brandAccent": "[Optional final accent letter]",
  "brandSubline": "[Optional short brand subline]",
  "sections": [
    {
      "number": "1.0",
      "title": "",
      "intro": "",
      "subsections": [
        {
          "number": "1",
          "title": "What is it?",
          "paragraphs": [],
          "bullets": [],
          "steps": [],
          "tip": "",
          "imagePlaceholder": "",
          "imageDescription": ""
        }
      ]
    }
  ],
  "helpfulTips": [{ "tip": "", "whyItHelps": "" }],
  "troubleshooting": [{ "issue": "", "whatToTry": "" }],
  "faqs": [{ "question": "", "answer": "" }],
  "whereToGetHelp": ["[Insert confirmed support contact]"]
}

Topic:
[Insert topic]

Audience:
[Insert audience]

Purpose:
[Insert purpose]

Process information:
[Paste process steps and notes here]
```

## Visual style notes

This version is designed to better match the provided corporate guide examples:

- Aptos-first font stack: `Aptos`, `Aptos Display`, `Segoe UI`, Arial, sans-serif.
- Light grey title banner.
- Green accent colour for section pills, subheading boxes, table emphasis, callouts and screenshot placeholders.
- Clean black/charcoal body text with grey metadata text.
- Rounded green-bordered subheadings, similar to the example guide style.
- Optional brand lockup on the title page using `brandName`, `brandAccent`, and `brandSubline` fields.

Do not add real logos or organisation-specific names to a public repository unless you have approval. For public-safe use, leave the optional brand fields blank.

## Privacy and publishing guidance

This tool runs in the browser. The text you paste is not uploaded by the tool itself. However, if you commit JSON files to a public GitHub repository, that content becomes public.

Do not commit student information, confidential procedures, internal-only documents, unpublished policies, private screenshots, or sensitive support information to a public repository.

For internal resources, use the GitHub page as a formatter and upload the final PDF/DOCX/HTML output to the relevant intranet or document library.

## Accessibility review

Before publishing a guide:

- Check heading order.
- Check colour contrast.
- Make sure screenshot placeholders include specific descriptions.
- Ensure table headers are meaningful.
- Replace placeholders with confirmed information.
- Run Microsoft Word Accessibility Checker on DOCX exports.
- Check PDF exports before sharing as a final version.
- Prefer the HTML version as the most accessible source format where possible.

## Notes about DOCX output

The DOCX export is generated in the browser as an editable Word draft. It is intended for editing and accessibility review. The HTML and PDF versions usually preserve the visual design more closely.

If you need stronger Word visual fidelity, use **Word-friendly HTML**, open it in Word, then save it as `.docx`.
