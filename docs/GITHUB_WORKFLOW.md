# GitHub collaboration workflow

## Accounts and permissions

- `imzyrix` is the maintainer and implementation account.
- `aaryaavinash` is the collaborator and reviewer account.
- GitHub repository permission checks on 2026-10-22 reported admin access for both accounts. Permissions can change; recheck before protected or administrative operations.
- `gh` was not installed in the audited local environment. SSH authentication to GitHub was also unavailable. The GitHub connector can access the repository as either linked identity, but that does not establish local Git push authentication.

## Verify identity before work

Check GitHub CLI identity and active accounts:

```sh
gh auth status --hostname github.com
gh auth switch --hostname github.com --user imzyrix
gh api user --jq .login
```

For collaborator work, switch to `aaryaavinash` and verify `.login` the same way. Do not assume a `gh` account switch changes Git-over-SSH or HTTPS identity.

Check local commit identity and push transport separately:

```sh
git config user.name
git config user.email
git remote -v
ssh -T git@github.com
git ls-remote origin HEAD
```

Use separate local Git configuration per identity or repository when needed. Set author name/email accurately; never write another account's name into a commit to make it appear that they authored or reviewed it. Never store tokens, private keys, or credentials in the repository.

## Branch, pull request, and review

1. `imzyrix` creates a focused implementation branch from an up-to-date `main`.
2. Commit with the true author identity; push only after verifying the actual Git transport identity.
3. Open a pull request targeting `main`, describing scope, risks, checks, and any follow-up work.
4. Request review from `aaryaavinash` only if that account is authorized and available for the change. Either account may work on branches, open PRs, or review where repository policy permits.
5. Review architecture, authorization, security, performance, error handling, documentation, and tests. Request changes when needed and resolve findings with new commits.
6. Merge only when all required checks, reviews, and repository protections are satisfied. Do not bypass branch protections.

When both accounts are controlled by one person, an automated or self-review can catch defects but is not independent human review and must not be represented as such. CODEOWNERS entries route review requests; they do not grant permissions or override repository rules.
