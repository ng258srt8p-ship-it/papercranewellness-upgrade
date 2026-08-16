# legacy/ — previous static site (archived)

This directory contains the pre-redesign static version of the Paper Crane
Wellness site: hand-written HTML pages, the old `src/` assets/scripts, the
former Playwright specs, the `blog/` pages, and an exported backup
(`papercranewellness.atwebpages.com BACKUP.zip`).

It is kept for reference only:

- The live site is now the React SPA at the repository root
  (deployed to https://papercranewellness.pages.dev).
- Nothing in this directory is built, tested, or deployed by the current
  tooling — its `package.json`/Playwright configs are part of the archive,
  not the project.
- Page content here (about, contact, legal pages, blog) was the copy source
  for the redesign; the current wording lives in `src/pages/` and
  `src/data/site.ts` at the root.
