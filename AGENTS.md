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
