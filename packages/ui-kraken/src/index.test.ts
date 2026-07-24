import { VERSION } from "./index";

describe("ui-kraken entry point", () => {
  it("exports a VERSION string", () => {
    expect(typeof VERSION).toBe("string");
  });
});
