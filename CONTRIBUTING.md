# Contributing to ZISKovač

## Pull Request Workflow (Required)

**All changes to `main` must go through a pull request. Direct pushes to `main` are not allowed.**

### How to contribute

1. **Create a branch** from `main`:
   ```bash
   git checkout main && git pull
   git checkout -b feat/your-feature-name
   # or: fix/your-fix, chore/your-task, docs/your-docs
   ```

2. **Make your changes** and commit them with clear messages:
   ```bash
   git commit -m "feat: add quote export to PDF"
   ```
   Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

3. **Push your branch** and open a pull request against `main`:
   ```bash
   git push origin feat/your-feature-name
   ```

4. **PR requirements:**
   - At least 1 approving review before merge
   - All CI checks must pass
   - Keep PRs focused — one concern per PR

5. **Merge** using "Squash and merge" or "Merge commit" (not rebase) so history stays clean.

### Branch naming

| Prefix    | When to use                        |
|-----------|------------------------------------|
| `feat/`   | New feature                        |
| `fix/`    | Bug fix                            |
| `chore/`  | Tooling, deps, config              |
| `docs/`   | Documentation only                 |
| `refactor/` | Code restructure, no behaviour change |

### Branch protection (enforced on GitHub)

The `main` branch has the following rules configured on GitHub:
- Require pull request before merging
- Require at least 1 approving review
- Dismiss stale reviews when new commits are pushed
- Direct pushes are blocked for all contributors

Any attempt to push directly to `main` will be rejected by the remote.
