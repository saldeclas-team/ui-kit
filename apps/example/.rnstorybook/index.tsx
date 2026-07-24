import AsyncStorage from "@react-native-async-storage/async-storage";

import { view } from "./storybook.requires";

// Storybook remembers the last opened story between reloads via the storage
// hook. Without it, every reload snaps back to the first story — annoying
// during iterative UI work.
const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

export default StorybookUIRoot;
