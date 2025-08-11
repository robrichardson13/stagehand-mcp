---
allowed-tools: Bash(npm run build:*), Bash(npm version:*), Bash(git push:*), Bash(npm publish:*)
argument-hint: '[major|minor|patch]'
description: 'Release a new version to npm'
---

## Context

- Current git status: !`git status`
- Current branch: !`git branch --show-current`
- Current package version: !`npm list --depth=0 | head -1`

## Your task

Release a new version using the standard process:

1. Build the project to ensure everything compiles
2. Bump version using npm version $ARGUMENTS (defaults to patch if no argument provided)
3. Push commits and tags to GitHub
4. Publish to npm

The version type should be:

- **patch** for bug fixes (1.0.1 → 1.0.2)
- **minor** for new features (1.0.1 → 1.1.0)
- **major** for breaking changes (1.0.1 → 2.0.0)

Complete all steps and confirm the release was successful.
