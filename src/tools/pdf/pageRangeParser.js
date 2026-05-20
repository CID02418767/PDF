const PAGE_RANGE_PATTERN = /^\d+(-\d+)?(,\d+(-\d+)?)*$/;

export function parsePageRanges(input, pageCount) {
  const normalized = input.replace(/\s+/g, "");

  if (!normalized) {
    throw new Error("Enter at least one page or page range.");
  }

  if (!PAGE_RANGE_PATTERN.test(normalized)) {
    throw new Error("Use page ranges like 1, 1-3, 1,3,5, or 1-3,6,8-10.");
  }

  const pages = [];
  const seen = new Set();

  for (const segment of normalized.split(",")) {
    const [startText, endText] = segment.split("-");
    const start = Number(startText);
    const end = endText ? Number(endText) : start;

    if (start < 1 || end < 1) {
      throw new Error("Page numbers must be 1 or greater.");
    }

    if (start > end) {
      throw new Error("Page ranges cannot be reversed.");
    }

    if (end > pageCount) {
      throw new Error(`Page ${end} is larger than this PDF's page count (${pageCount}).`);
    }

    for (let page = start; page <= end; page += 1) {
      if (!seen.has(page)) {
        seen.add(page);
        pages.push(page);
      }
    }
  }

  return pages;
}
