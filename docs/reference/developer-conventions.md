# Developer Conventions

- One person "owns" ticket from ToDo to Done
  - Owner asks for review
  - Owner merges
  - Owner asks for testing on test environment
  - Owner pushes through to prod (wherever sensible)
- Jira:
  - Person developing/reviewing/testing/releasing has their face on the ticket
- Branch naming - we’re not too strict here, but something along the lines of:
  - `feat/CFD-123-blah-blah-blah`
  - `feat/cfd-123-some-description-of-task` (_easiest to type as no capitals or underscores and still links through to JIRA_)
  - `fix/CFD-123_blah_blah_blah`
- Commit naming:
  - e.g. `feat: CFD-123 blah blah blah (#22)`
  - Follow [www.conventionalcommits.org](https://www.conventionalcommits.org/en/v1.0.0/#summary) [see table below](#conventional-commits)
- Raising PR:
  - Testing instructions just for quirks, nothing too prescriptive - give room for exploratory testing by the reviewer/tester
- Merge:
  - Merged by owner after approved by necessary reviewers
  - ‘Squash and merge’ for dev PRs
  - ‘Merge commit’ for preprod PRs
- Ready for release column:
  - Ticket moves here once tested on test environment
  - Can then be pushed preprod -> prod
  - Can wait for other tickets to bulk release if this makes sense

## Conventional Commits

| Commit Type | Title                    | Description                                                                                            | Emoji |
| ----------- | ------------------------ | ------------------------------------------------------------------------------------------------------ | ----- |
| feat        | Features                 | A new feature                                                                                          | ✨    |
| fix         | Bug Fixes                | A bug Fix                                                                                              | 🐛    |
| docs        | Documentation            | Documentation only changes                                                                             | 📚    |
| style       | Styles                   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc) | 💎    |
| refactor    | Code Refactoring         | A code change that neither fixes a bug nor adds a feature                                              | 📦    |
| perf        | Performance Improvements | A code change that improves performance                                                                | 🚀    |
| test        | Tests                    | Adding missing tests or correcting existing tests                                                      | 🚨    |
| build       | Builds                   | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)    | 🛠    |
| ci          | Continuous Integrations  | Changes to our CI configuration files and scripts (example scopes: Github Actions etc.)                | ⚙️    |
| chore       | Chores                   | Other changes that don't modify src or test files                                                      | ♻️    |
| revert      | Reverts                  | Reverts a previous commit                                                                              | 🗑    |
| content     | Content                  | Changes to content or copy throughout the repo                                                         | 📄    |
