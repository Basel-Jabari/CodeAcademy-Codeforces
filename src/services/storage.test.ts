import { loadState, saveState } from "./storage";

describe("persistent state storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores values under the Codeforces X PPU namespace", () => {
    saveState("activeTab", "contestBuilder");

    expect(localStorage.getItem("cfppu.activeTab")).toBe(
      '"contestBuilder"',
    );
  });

  it("loads structured JSON values", () => {
    saveState("crossAnalysis.handles", ["tourist", "Petr"]);

    expect(loadState<string[]>("crossAnalysis.handles", [])).toEqual([
      "tourist",
      "Petr",
    ]);
  });

  it("returns the fallback for missing or malformed data", () => {
    expect(loadState("missing", "fallback")).toBe("fallback");

    localStorage.setItem("cfppu.broken", "{not-json");
    expect(loadState("broken", { safe: true })).toEqual({ safe: true });
  });
});
