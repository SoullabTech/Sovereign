// src/services/notionIngestService.ts

export const notionIngestService = {
  ingestFromNotion: async () => {
    const pages = ["page-1", "page-2"];
    const results = pages.map((p) => ({ status: "fulfilled", page: p }));
    return { pages, results };
  },

  ingestFromLocalJson: async () => {
    const files = ["file1.json", "file2.json"];
    const results = files.map((f) => ({ status: "fulfilled", file: f }));
    return { files, results };
  },
};
