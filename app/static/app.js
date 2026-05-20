function filenameFromDisposition(disposition, fallback) {
  if (!disposition) {
    return fallback;
  }

  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match ? match[1] : fallback;
}

async function downloadResponse(response, fallbackName) {
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filenameFromDisposition(response.headers.get("content-disposition"), fallbackName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

document.querySelectorAll("[data-download-form]").forEach((form) => {
  const status = form.querySelector(".status");
  const button = form.querySelector("button");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (window.location.protocol === "file:") {
      status.textContent = "This app must be opened from a running website URL, not from a local file.";
      return;
    }

    status.textContent = "Processing...";
    button.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Request failed." }));
        throw new Error(error.detail || "Request failed.");
      }

      await downloadResponse(response, form.action.endsWith("/merge") ? "merged.pdf" : "split-pages.zip");
      status.textContent = "Done. Your download should start automatically.";
    } catch (error) {
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
});
