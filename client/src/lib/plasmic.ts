import { initPlasmicLoader } from "@plasmicapp/loader-react";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "psNPtVcnYUB9aDHgz6LmTF",  // ID of a project you are using
      token: "BUgf6UhxCjW9S7zSh6lF6TnrNGm8OacGtoar0wiz696zOjoi1hrmLnnm3FQtBR59BeSziOiDbp1H6apcaEsw"  // API token for that project
    }
  ],
  // Fetches the latest revisions, whether or not they were unpublished!
  // Disable for production to ensure you render only published changes.
  preview: true,
});
