---
"create-just-dom": minor
---

Support `.` as project name to scaffold into the current working directory (folder must be empty).

Respect `INIT_CWD` when the CLI is started via `pnpm run` / `npm run` so `.` and relative project names resolve from the directory where the user ran the command, not the workspace package root.
