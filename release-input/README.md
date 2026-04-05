# Release Inputs

This directory is a deploy-time staging area for generated release metadata that should not be authored by hand.

For AI runtime publishing, the desktop release pipeline should place these generated files here before the website build runs:

- `release-input/releases/ai-runtime/latest.json`
- `release-input/releases/ai-runtime/stable/latest.json`

The website build validates those files, confirms the root and stable manifests match, and republishes them verbatim to stable public paths:

- `/releases/ai-runtime/latest.json`
- `/releases/ai-runtime/stable/latest.json`

Do not commit generated JSON here.
