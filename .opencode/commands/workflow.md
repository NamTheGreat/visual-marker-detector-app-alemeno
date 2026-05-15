\---

description: Fire-and-forget autonomous workflow — plan, test, implement, commit

agent: build

\---



You are executing the autonomous multi-agent workflow. Run all phases without waiting for user input.



\*\*Task:\*\* $ARGUMENTS



If `$ARGUMENTS` is empty, stop: "Usage: `/workflow \&lt;task description\&gt;` (e.g., `/workflow Add user authentication to the API`)"



\## Phase 1: Setup

1\. Verify you are in a git repo (`git rev-parse --git-dir`). If not, stop.

2\. Check for uncommitted changes. If dirty, stop: "Commit or stash changes first."

3\. Create a feature branch: `git checkout -b workflow/$(date +%s)-$(echo "$ARGUMENTS" | head -c 30 | tr ' ' '-')`



\## Phase 2: Plan

Analyze the codebase. Create a detailed implementation plan:

\- Problem summary

\- Proposed approach

\- Files to modify / create

\- Risks and open questions

\- \*\*Test Design:\*\* Key behaviors to verify, edge cases, what NOT to test



\## Phase 3: Review Plan

Dispatch `@check` and `@simplify` in parallel to review the plan.



\*\*Merge rules:\*\*

\- `@check` safety findings are hard constraints

\- If `@simplify` recommends removing something `@check` needs, `@check` wins

\- Max 3 review cycles. If same findings twice, stop early.



\## Phase 4: Split into Tasks

Break the plan into discrete tasks for `@make`. Each task needs:

| Field | Description |

|-------|-------------|

| \*\*Task\*\* | Clear description |

| \*\*Acceptance Criteria\*\* | Checkbox format |

| \*\*Code Context\*\* | Actual code snippets |

| \*\*Files to Modify\*\* | Explicit list, mark new with "(create)" |

| \*\*Test File\*\* | Path for test file |



Task size: \~10-30 minutes each.



\## Phase 5: Write Tests

For each task, dispatch `@test` with the task spec + Test Design.



\*\*Post-step file gate:\*\* Before `@test`, snapshot `git diff --name-only`. After `@test`, verify only test-pattern files were added. If non-test files appear, discard and report violation.



\## Phase 6: Implement

For each task, dispatch `@make` with:

\- Task spec

\- Code context

\- Pre-written failing tests from `@test` (if TESTS\_READY)



`@make` runs TDD mode: validate RED → implement GREEN → regression check.



\## Phase 7: Final Review

Dispatch `@check` and `@simplify` in parallel on the full diff.



\## Phase 8: Commit \& Wrap Up

1\. Stage all changes

2\. Conventional commit message summarizing the implementation

3\. Write `.opencode/workflow-summary.md` with:

&#x20;  - Timestamp

&#x20;  - Task description

&#x20;  - Branch name

&#x20;  - TDD evidence (RED→GREEN per task)

&#x20;  - Review outcomes

&#x20;  - Files changed



\*\*If `gh` CLI is installed and authenticated:\*\* Create a draft PR with `gh pr create --draft`.



\## Failure Handling

If unrecoverable error at any phase:

1\. Write `.opencode/workflow-summary.md` with what failed

2\. Commit WIP as `wip: incomplete workflow`

3\. Stop execution

