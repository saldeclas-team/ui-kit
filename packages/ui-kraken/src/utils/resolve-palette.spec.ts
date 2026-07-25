import { resolvePalette } from "./resolve-palette";

interface FakePalette {
  a: string;
  b: string;
}

describe("resolvePalette", () => {
  it("returns the base reference unchanged when the override is undefined", () => {
    const base: FakePalette = { a: "#111", b: "#222" };
    expect(resolvePalette(base, undefined)).toBe(base);
  });

  it("keeps missing slots from the base and applies the ones passed", () => {
    const base: FakePalette = { a: "#111", b: "#222" };
    const merged = resolvePalette(base, { a: "#999" });
    expect(merged.a).toBe("#999");
    expect(merged.b).toBe("#222");
  });

  it("returns a new object (does not mutate the base) when the override is defined", () => {
    const base: FakePalette = { a: "#111", b: "#222" };
    const merged = resolvePalette(base, { a: "#999" });
    expect(merged).not.toBe(base);
    expect(base.a).toBe("#111");
  });

  it("full override replaces every slot from the base", () => {
    const base: FakePalette = { a: "#111", b: "#222" };
    const merged = resolvePalette(base, { a: "#333", b: "#444" });
    expect(merged).toEqual({ a: "#333", b: "#444" });
  });
});
