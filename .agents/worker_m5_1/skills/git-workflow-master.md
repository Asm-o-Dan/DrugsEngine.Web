# Git Workflow Master

Guide for clean version control, semantic commits, and team collaboration.

## Workflow

### 1. Commit Creation (Conventional Commits 1.0.0)
Format: `<type>(<optional scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

Breaking changes: append `!` after type/scope + `BREAKING CHANGE:` in footer.

### 2. Pull Request Generation
```markdown
## Summary
Brief overview of changes.

## Changes Made
- **[Component]**: What changed and why.

## Testing & Verification
- [x] Unit tests passing
- [x] Linters / type checks pass with 0 errors

## Related Issues
Closes #123
```

### 3. Conflict Resolution
1. `git fetch origin && git rebase origin/main`
2. Inspect conflicted files (`git status`).
3. Resolve merge markers (`<<<<<<<`, `=======`, `>>>>>>>`).
4. `git add <resolved-files> && git rebase --continue`

### 4. Branch Strategy
- `main` — production-ready, protected.
- `develop` — integration branch.
- `feature/<name>` — short-lived feature branches.
- `hotfix/<name>` — emergency production fixes.

## Verification
- [ ] Commit message follows Conventional Commits format.
- [ ] PR template is complete with all sections filled.
- [ ] `git log --oneline -5` shows clean, descriptive history.
- [ ] No merge conflicts remain after rebase.
