# Vercel verification notes

Checked on 2026-10-25 for commit `b09f3bb547a3b648ac4da94bc908a9f68bd3995b` (`feat/dashboard-visual-recovery`).

## Verified

- Production homepage `https://opencluster.vercel.app/` returned HTTP 200 and served the OpenCluster HTML application shell.
- The production JavaScript bundle and stylesheet referenced by that shell both returned HTTP 200.
- GitHub's commit status API reported `Vercel: success` for the current commit. This confirms Vercel's reported status for the commit; it does not prove the preview UI was opened or visually tested.

## Issues and limits

- The branch preview `https://opencluster-git-feat-dashboard-visual-recovery-zyrix-dev.vercel.app/` is protected by Vercel Authentication and returned HTTP 302 to its protection message. Its rendered application and interactions could not be checked anonymously.
- Vercel deployment inspection returned HTTP 403 because this connection is not authorized for team `zyrix-dev`. A one-time authorization link was generated and requires the user to approve team access; it expires after 10 minutes. The temporary link is intentionally not stored in this repository.
- The GitHub CLI (`gh`) is not installed, so PR/check details could not be queried with it. Public GitHub APIs were used for the commit status instead.
- No browser-based visual QA, runtime interaction check, or build-log inspection was completed as part of this Vercel status check.
- Directly pushing to `main` is disallowed by `docs/GITHUB_WORKFLOW.md` and the repository instructions. Changes must be pushed on a branch and submitted through a PR after verifying the Git push identity and satisfying required checks/reviews. The successful `git ls-remote` only confirmed read access; it did not establish the identity authorized to push.

## Next steps

1. Approve the Vercel team-access link provided by the assistant, then retry deployment inspection for the commit above.
2. Use the authorized preview URL to inspect the rendered page and interactions.
3. Keep repository changes on a branch and use the required PR/review workflow; do not push directly to `main`.
