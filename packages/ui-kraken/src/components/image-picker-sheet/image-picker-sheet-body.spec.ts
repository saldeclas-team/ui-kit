/**
 * Direct test of the platform-agnostic fallback. Metro / jest-
 * expo resolve .ios / .android / .web variants first; this file
 * only fires on runtimes with none of those. Both methods
 * resolve `null`; `supportsCamera` is false.
 */

import type * as ImagePickerBodyModule from "./image-picker-sheet-body";

// Import the fallback file directly by full filename.
const { imagePickerBody } =
  require("./image-picker-sheet-body.tsx") as typeof ImagePickerBodyModule;

describe("imagePickerBody (fallback)", () => {
  it("supportsCamera=false", () => {
    expect(imagePickerBody.supportsCamera).toBe(false);
  });

  it("pickFromCamera resolves null", async () => {
    expect(await imagePickerBody.pickFromCamera({})).toBeNull();
  });

  it("pickFromLibrary resolves null", async () => {
    expect(await imagePickerBody.pickFromLibrary({})).toBeNull();
  });
});
