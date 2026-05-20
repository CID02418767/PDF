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

function createRangeRows(form) {
  const partsInput = form.querySelector("[data-parts-input]");
  const rangeList = form.querySelector("[data-range-list]");

  if (!partsInput || !rangeList) {
    return;
  }

  const parts = Math.max(1, Number.parseInt(partsInput.value, 10) || 1);
  const existingRows = Array.from(rangeList.querySelectorAll(".range-row")).map((row) => ({
    start: row.querySelector("[data-range-start]")?.value || "",
    end: row.querySelector("[data-range-end]")?.value || "",
  }));

  rangeList.replaceChildren();

  for (let index = 0; index < parts; index += 1) {
    const row = document.createElement("div");
    row.className = "range-row";
    row.innerHTML = `
      <div class="range-label">Part ${index + 1}</div>
      <label>
        Start page
        <input type="number" min="1" step="1" required data-range-start />
      </label>
      <label>
        End page
        <input type="number" min="1" step="1" required data-range-end />
      </label>
    `;

    const startInput = row.querySelector("[data-range-start]");
    const endInput = row.querySelector("[data-range-end]");
    startInput.value = existingRows[index]?.start || (index === 0 ? "1" : "");
    endInput.value = existingRows[index]?.end || "";
    rangeList.appendChild(row);
  }
}

function serializeRangeRows(form) {
  const rows = Array.from(form.querySelectorAll("[data-range-list] .range-row"));
  const ranges = rows.map((row) => ({
    start: row.querySelector("[data-range-start]").value,
    end: row.querySelector("[data-range-end]").value,
  }));

  const rangesInput = form.querySelector("[data-ranges-input]");
  if (rangesInput) {
    rangesInput.value = JSON.stringify(ranges);
  }
}

document.querySelectorAll("[data-download-form]").forEach((form) => {
  const status = form.querySelector(".status");
  const button = form.querySelector("button");
  const partsInput = form.querySelector("[data-parts-input]");

  createRangeRows(form);
  partsInput?.addEventListener("input", () => createRangeRows(form));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (window.location.protocol === "file:") {
      status.textContent = "This app must be opened from a running website URL, not from a local file.";
      return;
    }

    status.textContent = "Processing...";
    button.disabled = true;
    serializeRangeRows(form);

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
