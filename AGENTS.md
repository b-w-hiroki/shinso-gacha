# Development completion flow

- Read the latest main, open PRs, CI and relevant docs before changing code. Preserve newer changes and never resolve conflicts by blindly taking ours/theirs.
- Implement, run relevant checks, inspect mobile browser screenshots, open a PR, and verify required CI before an authorized merge.
- After merging, remove the disposable head branch promptly. Confirm the PR is actually merged into the default branch, the current head still matches its merged PR head, and no open PR uses the branch as a base or head. Preserve default, protected, release, environment and active branches.
- `.github/workflows/cleanup-merged-branches.yml` performs remote cleanup on merged PR close. Its initial installation/update on main and its manual run sweep older merged PRs. It never checks out PR code; protected/changed/reused branches are skipped.
- When a local checkout exists, switch to updated main, verify there are no uncommitted or unmerged changes, remove the finished local branch, and run `git fetch --prune`. A squash merge alone is not proof that a local branch is disposable; compare its tip with the merged PR's head. Do not force-delete unknown work.
- Include PR/CI status, remaining limitations and branch cleanup results in the completion report.
- Keep the observation UI focused on one large scene. Preserve the existing world and game loop, save compatibility, point accounting, and mobile readability. Unseen records must not reveal their names or images.

- Preserve horror, unease and tension over arcade presentation. Keep patrol/growth rewards understated, avoid combo/speed pressure and celebratory overlays, and leave the scene legible. Put primary controls below content or in the existing lower navigation; never cover text with stamps.
