# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

(Node.js support requirements have sometimes increased in minor or patch releases.)

## [Unreleased]

### Documentation

- Refresh the package description, correct README links and attribution, and align the license filename with documentation links.

### Maintenance

- Add automated repository and optional homepage link checks on pushes, pull requests, manual runs, and a weekly schedule.
- Upgrade pnpm to 12.16.1 and update and pin release and repository metadata actions.
- Rename `clean` to `clean-deep` and simplify cleanup of ignored files.
- Switch npm publishing to one-time passwords retrieved through the 1Password CLI.

## [1.0.11] - 2026-05-22

### Documentation

- Remove the README roadmap of future development plans.
- Update contribution instructions and repository-tooling notes, and refresh license references.

### Maintenance

- Upgrade to pnpm 11, refresh development dependencies, fix ESLint/Prettier hoisting, migrate build approvals, and use shx for cleanup.
- Fix local publishing by passing the npm authentication token directly to pnpm.
- Update and pin workflow actions, set explicit permissions, disable persisted checkout credentials, and accept release tags with or without a `v` prefix.

## [1.0.10] - 2025-11-04

### Maintenance

- Update the declared `http-proxy-middleware` requirement to `^2.0.9`.
- Refresh pnpm, bumpp, and Prettier; centralize native build approvals, configure tool hoisting, and exclude pnpm YAML files from formatting.
- Configure token-based local npm publishing and restrict publishing to the main branch.
- Upgrade and simplify the repository metadata synchronization workflow.

## [1.0.9] - 2025-03-04

### Documentation

- Correct the repository link format in package metadata.

### Maintenance

- Update the declared `http-proxy-middleware` requirement to `^2.0.7`.
- Upgrade contributor tooling to pnpm 10.5.2, remove the pnpm engine constraint, refresh development dependencies, and approve native dependency build scripts.

## [1.0.8] - 2024-09-14

### Maintenance

- Adopt pnpm 9.10.0 for development and publishing, add a cleanup script, and refresh release and formatting dependencies.
- Allow manual execution of repository metadata synchronization.

## [1.0.7] - 2024-06-10

### Documentation

- Fix the missing comma in the `addPlugin` example for disabling middleware ([#2](https://github.com/kitschpatrol/eleventy-plugin-parcel/pull/2)).

### Maintenance

- Update Prettier and switch release-note, GitHub release, and metadata workflows to kitschpatrol actions.

## [1.0.6] - 2024-05-03

### Changed

- **Breaking:** Restrict declared Eleventy compatibility from `>=2.0.0` to `^2.0.0`, excluding Eleventy 3 and later.

### Documentation

- Correct repository and issue-tracker URLs in package metadata.
- Correct README dependency guidance and add a related Eleventy/Parcel integration article.

### Maintenance

- Fix the release script to invoke `npm publish` and update bumpp.

## [1.0.5] - 2024-03-28

### Changed

- Lower the declared Node.js minimum from 14.18.0 to 14.
- **Breaking:** Set declared Eleventy compatibility to `>=2.0.0`, dropping support for 2.0.0 canary releases.

### Documentation

- Reorganize the README into setup, usage, configuration, and background sections; document runtime requirements and add contribution and licensing guidance.

### Maintenance

- Add lint, formatting-fix, and release scripts with ESLint, Prettier, and bumpp development dependencies.
- Add GitHub workflows for releases from version tags on main and repository metadata synchronization.
- Start tracking the npm lockfile for reproducible contributor installs.

## [1.0.4] - 2023-02-04

### Changed

- **Breaking:** Raise the declared Node.js minimum from 12 to 14.18.0.
- **Breaking:** Move Parcel core, its default configuration, and the root resolver to peer dependencies, with Parcel requirements set to `^2.7.0`.

## [1.0.3] - 2022-12-05

### Documentation

- Add an npm package/version badge to the README.

### Maintenance

- Update the declared `@parcel/core` and `@parcel/config-default` requirements from `^2.7.0` to `^2.8.0`.

## [1.0.2] - 2022-09-26

### Changed

- Change the default staging folder from `.11ty-parcel` to `.11ty-parcel-temp`.

### Fixed

- Use `tempFolderName` as the default Parcel middleware output directory.

### Documentation

- Explain staging-folder persistence during serving and recommend ignoring it and `.parcel-cache` in Git.

## [1.0.1] - 2022-09-17

### Documentation

- Document all plugin option keys and defaults, automatic entry/output paths and build modes, and examples for disabling middleware and rewriting URLs.

## [1.0.0] - 2022-09-16

### Added

- Introduce a CommonJS Eleventy 2 plugin that bundles, transpiles, and optimizes site output with Parcel 2; declare Node.js >=12 support.
- Serve sites through Parcel middleware with HMR by default, or disable middleware to post-process builds served by Eleventy.
- Support custom Parcel options and entry points, proxy options, Eleventy server options, and staging folders; default to production builds and development mode when serving.
- Configure root-relative asset resolution in the project's `package.json` and enable automatic Parcel plugin installation, with caching disabled by default.
- Skip Parcel post-processing for JSON/NDJSON output and builds producing no files.
- Copy passthrough assets for Parcel and disable Eleventy server DOM diffing for compatibility with bundled output.

### Documentation

- Provide npm installation and Eleventy registration instructions, required `.parcelrc` resolver setup, build/serve commands, configuration examples, and compatibility caveats.

### Maintenance

- Establish MIT licensing and initial editor, ESLint, and Prettier configuration.

[Unreleased]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.11...HEAD
[1.0.0]: https://github.com/kitschpatrol/eleventy-plugin-parcel/releases/tag/v1.0.0
[1.0.1]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.0...v1.0.1
[1.0.2]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.1...v1.0.2
[1.0.3]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.2...v1.0.3
[1.0.4]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.3...v1.0.4
[1.0.5]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.4...v1.0.5
[1.0.6]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.5...v1.0.6
[1.0.7]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.6...v1.0.7
[1.0.8]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.7...v1.0.8
[1.0.9]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.8...v1.0.9
[1.0.10]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.9...v1.0.10
[1.0.11]: https://github.com/kitschpatrol/eleventy-plugin-parcel/compare/v1.0.10...v1.0.11
