/**
 * Utility for printing clean documents (e.g. A4 Quotations, Invoices, Slips)
 * using an isolated hidden iframe.
 *
 * This guarantees:
 * 1. Zero leakage of ERP layout (Sidebar, Header, Main table)
 * 2. Perfect native Thai font rendering via Chromium's HarfBuzz engine
 * 3. Removal of screen preview wrappers (box-shadows, borders, dark backdrops)
 * 4. True A4 sizing and margins
 */
export function printElement(elementId: string, title: string = "Document") {
  if (typeof window === "undefined") return;

  const sourceElement = document.getElementById(elementId);
  if (!sourceElement) {
    console.error(`[printElement] Element with ID "${elementId}" not found.`);
    return;
  }

  // Remove existing print iframe if any
  const existingIframe = document.getElementById("abcpos-print-frame");
  if (existingIframe) {
    existingIframe.remove();
  }

  // Create an invisible iframe
  const iframe = document.createElement("iframe");
  iframe.id = "abcpos-print-frame";
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "0px";
  iframe.style.height = "0px";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    console.error("[printElement] Unable to access iframe document.");
    iframe.remove();
    return;
  }

  // Collect all CSS styles and link tags from current page
  let stylesHtml = "";
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    stylesHtml += node.outerHTML + "\n";
  });

  // Extract inner HTML of template to strip outer preview card wrappers
  const contentHtml = sourceElement.innerHTML;

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="utf-8" />
        <base href="${window.location.origin}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        ${stylesHtml}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm 10mm 10mm;
          }
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          /* Ensure no preview shadows or borders leak into print */
          .shadow-2xl, .shadow-xl, .shadow-lg, .shadow-md, .shadow-sm, .shadow-xs {
            box-shadow: none !important;
          }
          .rounded-3xl, .rounded-2xl, .rounded-xl, .rounded-lg, .rounded-md, .rounded-sm {
            border-radius: 0px !important;
          }
          .print-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
        </style>
      </head>
      <body>
        <div class="print-wrapper">
          ${contentHtml}
        </div>
      </body>
    </html>
  `);
  iframeDoc.close();

  // Wait for images and fonts to finish rendering in iframe before triggering print
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("[printElement] Error triggering print:", err);
    } finally {
      // Clean up iframe after print dialog closes
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          iframe.remove();
        }
      }, 2000);
    }
  };

  // Wait 350ms to ensure Tailwind font assets and images are ready
  setTimeout(triggerPrint, 350);
}
