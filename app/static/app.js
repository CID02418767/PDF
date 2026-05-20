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

function createMergeController(form) {
  const fileInput = form.querySelector("[data-merge-files]");
  const mergeList = form.querySelector("[data-merge-list]");
  const files = [];

  function render() {
    if (!mergeList) {
      return;
    }

    mergeList.replaceChildren();
    files.forEach((file, index) => {
      const item = document.createElement("li");
      item.className = "merge-item";

      const name = document.createElement("span");
      name.className = "merge-name";
      name.textContent = file.name;

      const controls = document.createElement("div");
      controls.className = "merge-controls";

      const upButton = document.createElement("button");
      upButton.type = "button";
      upButton.className = "icon-button";
      upButton.textContent = "↑";
      upButton.title = "Move up";
      upButton.disabled = index === 0;
      upButton.addEventListener("click", () => {
        [files[index - 1], files[index]] = [files[index], files[index - 1]];
        render();
      });

      const downButton = document.createElement("button");
      downButton.type = "button";
      downButton.className = "icon-button";
      downButton.textContent = "↓";
      downButton.title = "Move down";
      downButton.disabled = index === files.length - 1;
      downButton.addEventListener("click", () => {
        [files[index], files[index + 1]] = [files[index + 1], files[index]];
        render();
      });

      controls.append(upButton, downButton);
      item.append(name, controls);
      mergeList.appendChild(item);
    });
  }

  fileInput?.addEventListener("change", () => {
    files.splice(0, files.length, ...Array.from(fileInput.files || []));
    render();
  });

  render();

  return {
    createFormData() {
      const data = new FormData();
      files.forEach((file) => data.append("files", file, file.name));
      return data;
    },
    hasEnoughFiles() {
      return files.length >= 2;
    },
  };
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
  const mergeController = form.action.endsWith("/merge") ? createMergeController(form) : null;

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
      if (mergeController && !mergeController.hasEnoughFiles()) {
        throw new Error("Please choose at least two PDF files.");
      }

      const response = await fetch(form.action, {
        method: "POST",
        body: mergeController ? mergeController.createFormData() : new FormData(form),
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
