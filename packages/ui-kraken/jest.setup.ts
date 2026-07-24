// @testing-library/react-native v12+ ships its matchers directly (the
// standalone @testing-library/jest-native package is deprecated).
import * as matchers from "@testing-library/react-native/matchers";

expect.extend(matchers);
