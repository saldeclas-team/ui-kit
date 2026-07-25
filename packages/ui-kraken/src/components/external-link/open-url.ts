import { Linking } from "react-native";

/**
 * Optional in-app browser backend. If `expo-web-browser` is installed
 * (opt-in via the consumer's peer deps), we prefer it for the nicer
 * in-app UX. If the module is not present, `openExternalUrl` falls
 * back to RN `Linking.openURL` (kicks the URL to the system browser).
 *
 * The try / catch require pattern is the standard convention for
 * optional peer deps in React Native — Metro handles it at bundle
 * time and the runtime just sees `null` when the module isn't
 * installed.
 */
let openInAppBrowser: ((url: string) => Promise<unknown>) | null = null;
try {
  const mod = require("expo-web-browser") as {
    openBrowserAsync?: (url: string) => Promise<unknown>;
  };
  if (typeof mod?.openBrowserAsync === "function") {
    openInAppBrowser = mod.openBrowserAsync.bind(mod);
  }
} catch {
  // expo-web-browser is not installed — Linking fallback will handle it.
}

/**
 * Open `url` in whichever browser backend is available. Errors from
 * either backend are caught and swallowed so a failed open never
 * crashes the app — the primitive fails silently, matching the way
 * anchor `<a href>` tags degrade on the web when a URL is unreachable.
 *
 * Exported so ExternalLink's spec can mock the whole helper cleanly
 * without having to reach into the require-based backend selection.
 */
export async function openExternalUrl(url: string): Promise<void> {
  try {
    if (openInAppBrowser) {
      await openInAppBrowser(url);
      return;
    }
    await Linking.openURL(url);
  } catch {
    // Silent — see docstring above.
  }
}

/**
 * Test-only escape hatch that lets `open-url.spec.ts` inspect and
 * override the module-level backend selection without patching
 * `require`. Not part of the public API.
 */
export const __setOpenInAppBrowser = (next: ((url: string) => Promise<unknown>) | null): void => {
  openInAppBrowser = next;
};

/**
 * Read the currently-selected in-app browser backend (or `null` when
 * the fallback path is active). Test-only.
 */
export const __getOpenInAppBrowser = (): ((url: string) => Promise<unknown>) | null =>
  openInAppBrowser;
