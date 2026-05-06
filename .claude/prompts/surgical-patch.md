<!-- Source: docs/canon/CLAUDE_CODE_GOVERNANCE.md §7 -->

SURGICAL PATCH ONLY.

Implement the smallest safe change for:

[task]

Constraints:
- no broad refactor
- no new architecture unless unavoidable
- no unrelated cleanup
- no formatting churn
- preserve current API behavior
- keep changes limited to the necessary files

After patch:
- show changed files
- explain exact behavior change
- run targeted verification
- do not proceed to next task
