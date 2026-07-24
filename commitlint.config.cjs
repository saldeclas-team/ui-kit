// Conventional Commits (https://www.conventionalcommits.org/).
// Types allowed: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [0],
    "body-max-line-length": [0],
  },
};
