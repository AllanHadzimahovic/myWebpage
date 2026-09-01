---
name: git-push
description: >
  Commit local changes (when needed) and push the current branch to GitHub.
  Handles staging, commit message, gh auth setup if credentials are wrong,
  and reports the remote URL. Use when the user says "push to github",
  "pull to github", "git push", or runs /git-push.
---

# git-push

Push the current repo branch to GitHub. Treat “pull to github” / “upload to github” as push.

## Steps

1. Confirm you are inside a git repo. If not, stop and say so.
2. Run in parallel:
   - `git status`
   - `git diff` and `git diff --staged`
   - `git log -5 --oneline`
   - `git remote -v` and `git branch -vv`
3. If there is no remote, stop and ask how to create/link one (`gh repo create` or an existing URL).
4. If there are uncommitted changes the user intends to publish:
   - Stage relevant files (`git add`), not secrets (`.env`, credentials, private keys).
   - Commit with a short message matching repo style (`git log` as reference). Use a HEREDOC.
   - Never commit if there is nothing to commit.
5. Push the current branch:
   - Tracked: `git push`
   - No upstream yet: `git push -u origin HEAD`
6. On auth / 403 failures (wrong GitHub user, expired token, credential helper mismatch):
   - Run `gh auth status`
   - Run `gh auth setup-git`
   - Retry the push
   - If still failing, run `gh auth login` (user completes browser/device flow), then retry
7. Report:
   - Commit hash and subject (if a commit was made)
   - Branch name
   - Remote repo URL (https://github.com/…)

## Rules

- Never force-push (`--force` / `--force-with-lease`) unless the user explicitly asks.
- Never amend or rewrite history unless the user explicitly asks and the conditions in the global commit rules are met.
- Do not push unrelated local repos; stay in the workspace project the user is working on.
