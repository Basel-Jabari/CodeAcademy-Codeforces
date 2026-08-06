import {
  clearStateByPrefix,
  dropOutdatedState,
  loadState,
  saveState,
} from "./storage";

describe("persistent state storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores values under the versioned Codeforces X PPU namespace", () => {
    saveState("activeTab", "contestBuilder");

    expect(localStorage.getItem("cfppu.v1.activeTab")).toBe(
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

    localStorage.setItem("cfppu.v1.broken", "{not-json");
    expect(loadState("broken", { safe: true })).toEqual({ safe: true });
  });

  it("returns the fallback when a stored null would break the caller", () => {
    localStorage.setItem("cfppu.v1.empty", "null");

    expect(loadState<string[]>("empty", [])).toEqual([]);
  });

  it("drops entries saved by an older version and keeps current ones", () => {
    localStorage.setItem("cfppu.v0.activeTab", '"randomizer"');
    localStorage.setItem("cfppu.legacy", '"randomizer"');
    saveState("activeTab", "contestBuilder");
    localStorage.setItem("problemsList", '{"problemsList":[]}');

    dropOutdatedState();

    expect(localStorage.getItem("cfppu.v0.activeTab")).toBeNull();
    expect(localStorage.getItem("cfppu.legacy")).toBeNull();
    expect(localStorage.getItem("cfppu.v1.activeTab")).toBe('"contestBuilder"');
    expect(localStorage.getItem("problemsList")).toBe('{"problemsList":[]}');
  });

  it("clears only keys under a logical prefix", () => {
    saveState("randomizer.expression", { type: "LOOSE" });
    saveState("randomizer.participantHandles", "tourist");
    saveState("contestBuilder.report", "keep me");
    saveState("activeTab", "randomizer");

    clearStateByPrefix("randomizer.");

    expect(localStorage.getItem("cfppu.v1.randomizer.expression")).toBeNull();
    expect(
      localStorage.getItem("cfppu.v1.randomizer.participantHandles"),
    ).toBeNull();
    expect(localStorage.getItem("cfppu.v1.contestBuilder.report")).toBe(
      '"keep me"',
    );
    expect(localStorage.getItem("cfppu.v1.activeTab")).toBe('"randomizer"');
  });
});
