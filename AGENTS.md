<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:audit-the-app-not-the-code -->
# Audit the running application, not the source files

Reading source code and assuming it works is how bugs get missed. You MUST verify by interacting with the live application.

## Rules

1. **Never report a feature as "working" based on code inspection.** A feature works when you have exercised it end-to-end on the live site.

2. **Every audit starts at the URL, not the file tree.** Open the page. Click buttons. Fill forms. Submit. Check what happens. Then read code to explain what you observed.

3. **User-facing features that have no UI are bugs.** If a server action supports a field but there's no button, input, or form to set it, that's a missing feature — regardless of how clean the server action looks.

4. **When investigating a report, reproduce it first.** Before touching any code, go to the live site and make the error happen yourself. Capture the exact URL, error message, and steps. Only then open source files.

5. **"Read-only" UI counts as missing functionality unless there's a separate edit page.** If a detail page shows data but has no way to change it, and no edit page exists, that's a gap.

6. **Forms and dialogs must be tested end-to-end.** Does the form submit? Does the toast appear? Does the data persist after refresh? Does the list update? Verify all four.

7. **Every new feature must be exercised on the live deployment before being marked complete.** Not just the dev server. The production URL.

8. **When something breaks, say "I haven't tested this" instead of pretending you knew it worked.** Honesty about what you haven't verified is more useful than false confidence.
<!-- END:audit-the-app-not-the-code -->

<!-- BEGIN:debugging-discipline -->
# Debugging discipline

## Before reporting or fixing any bug

1. **Build a feedback loop first.** You need a tight, deterministic, fast way to reproduce the bug before forming any hypothesis. No red-capable feedback loop = no theory.

2. **Reproduce the exact symptom the user described.** Not a nearby error. Not a code smell. The exact thing the user reported. Capture the URL, error message, and steps.

3. **Evidence score everything.** Every diagnosis must include a confidence score (1-5). 1 = observed directly. 5 = root cause reproduced and verified. Below 4/5 evidence, do NOT implement a fix.

4. **Never state that something IS the cause unless proven.** Use: "Possible", "Likely", "Hypothesis", "Confirmed". No "I'm confident this is the issue" without supporting evidence.

5. **Generate 3-5 falsifiable hypotheses before picking one.** Each hypothesis must state a specific prediction: "If X is the cause, then changing Y will make the bug disappear."

6. **Show ranked hypotheses to the user before implementing.** They may have domain knowledge that instantly re-ranks.

7. **Tag every debug log with a unique prefix** like `[DEBUG-a4f2]` so cleanup is a single grep.

## When stuck

If after 30 minutes of debugging or three tested hypotheses the root cause is still unconfirmed: STOP. Summarise everything learned, remaining hypotheses, evidence collected, and recommended next experiment. Do NOT continue making speculative fixes.

## Severity scale for bugs

- **Critical:** App cannot be used. Login impossible, can't create core entities, data loss, white screen, OAuth broken.
- **High:** Core workflow blocked. Can't create crosses, can't evaluate seedlings, can't import CSV.
- **Medium:** Workflow slowed. Missing loading spinner, search not debounced, missing tooltip.
- **Low:** Polish. Typography, spacing, copy, animation.

## Fix discipline

1. Fix the smallest possible change that addresses the confirmed root cause.
2. No unrelated refactors during a bug fix.
3. Build and verify after EVERY change before declaring success.
4. If the fix doesn't work, undo it and try the next hypothesis — don't pile changes on top of each other.
<!-- END:debugging-discipline -->
