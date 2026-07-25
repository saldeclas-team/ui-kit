import { Linking } from "react-native";

import { __getOpenInAppBrowser, __setOpenInAppBrowser, openExternalUrl } from "./open-url";

describe("openExternalUrl", () => {
  const originalBrowser = __getOpenInAppBrowser();
  let openURLSpy: jest.SpyInstance<Promise<unknown>, [string]>;

  beforeEach(() => {
    openURLSpy = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValue(true as unknown as Awaited<ReturnType<typeof Linking.openURL>>);
  });

  afterEach(() => {
    __setOpenInAppBrowser(originalBrowser);
    openURLSpy.mockRestore();
  });

  it("uses the in-app browser backend when it is installed", async () => {
    const inApp = jest.fn().mockResolvedValue(undefined);
    __setOpenInAppBrowser(inApp);
    await openExternalUrl("https://example.com");
    expect(inApp).toHaveBeenCalledWith("https://example.com");
    expect(openURLSpy).not.toHaveBeenCalled();
  });

  it("falls back to Linking.openURL when the in-app browser backend is not installed", async () => {
    __setOpenInAppBrowser(null);
    await openExternalUrl("https://example.com/terms");
    expect(openURLSpy).toHaveBeenCalledWith("https://example.com/terms");
  });

  it("swallows errors thrown by the in-app browser backend", async () => {
    const inApp = jest.fn().mockRejectedValue(new Error("boom"));
    __setOpenInAppBrowser(inApp);
    await expect(openExternalUrl("https://example.com")).resolves.toBeUndefined();
    expect(inApp).toHaveBeenCalled();
    // Linking is not called after the in-app backend throws — the helper
    // catches and swallows so a failed open never crashes the app.
    expect(openURLSpy).not.toHaveBeenCalled();
  });

  it("swallows errors thrown by the Linking fallback", async () => {
    __setOpenInAppBrowser(null);
    openURLSpy.mockRejectedValueOnce(new Error("no browser"));
    await expect(openExternalUrl("https://example.com")).resolves.toBeUndefined();
    expect(openURLSpy).toHaveBeenCalled();
  });
});
