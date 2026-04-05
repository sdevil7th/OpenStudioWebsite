# Release Inputs

This directory is a deploy-time staging area for generated release metadata that should not be authored by hand.

For release publishing, the desktop release pipeline should place these generated files here before the website build runs:

- `release-input/releases/latest.json`
- `release-input/releases/stable/latest.json`
- `release-input/releases/ai-runtime/latest.json`
- `release-input/releases/ai-runtime/stable/latest.json`
- `release-input/appcast/windows-stable.xml`
- `release-input/appcast/macos-stable.xml`

The website build validates those files, confirms the root and stable manifests match where required, validates that the stable appcasts align with the stable app manifest, and republishes them verbatim to stable public paths:

- `/releases/latest.json`
- `/releases/stable/latest.json`
- `/releases/ai-runtime/latest.json`
- `/releases/ai-runtime/stable/latest.json`
- `/appcast/windows-stable.xml`
- `/appcast/macos-stable.xml`

Do not commit generated metadata or appcast files here.
