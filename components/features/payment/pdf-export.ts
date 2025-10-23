"use client";

export async function downloadElementAsPdfMock(element: HTMLElement, filename = "receipt.pdf") {
  // Client-only HTML Blob mock simulating PDF export; no external libs
  const html = `<!doctype html><meta charset="utf-8"><title>${filename}</title>` + element.outerHTML;
  const blob = new Blob([html], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

