# SignForge Client

React + Vite application for SignForge.

## Plasmic Codegen How-To

### Prerequisites
- Node 18+

### Setup
1. Run once: `npm run plasmic:init` (login in browser → choose React / TypeScript / src)
2. Set your project ID in package.json scripts (replace `REPLACE_WITH_PROJECT_ID`)
3. Each time you publish in Plasmic, run: `npm run plasmic:sync`
4. Start the app from repo root: `npm run dev` and open Vite URL

### Demo Route
To enable the Plasmic demo route, set the environment variable:
```bash
VITE_ENABLE_PLASMIC_DEMO=true
```

The demo route will be available at `/plasmic-demo` when enabled.
