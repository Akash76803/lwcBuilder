# Authoritative LWC Builder tracker

Google Sheets: https://docs.google.com/spreadsheets/d/1etAPOARs7fVSzfkZb-36j9w5jRoJI65qf8ABbEftO-Q/edit?usp=drivesdk

Keep this Drive tracker authoritative. Refresh after implementation, fixes, QA, deployment or status changes with purpose/scope, status, testing evidence, deliverable/version, blockers and the next action. Read its current contents before updating; do not replace manual edits from stale conversation context.

Current next action: Dev Org UAT of Screen Builder foundation (categorized registry, nested layout canvas, component-specific properties and sibling duplication). Then implement datatable columns and popup form editors; multiple screens and event/condition editors follow. Data Pack visual configuration remains available; live providers and runtime inputs are deferred per Akash's current scope. Code moves to main through a PR after checks and relevant Dev Org UAT. Tracker updates are made during project work; no background monitoring is configured.

### Custom table designer — 2026-10-02
- Implemented on testing: generic field/input/calculated columns; Cell / Design / Calculate / Rules editor; nested Data Pack field choices, grouped headers, per-row edits/selection, optional mixed discounts, numeric row rules and sample Save output.
- Local validation: 49 tests, 34 compiled LWC files, compiled-DOM table interaction smoke PASS. Prior selector selection fix is confirmed working by user in Dev Org.
- Next: user deploy/UAT table designer and JSON round trip; then popup form builder and row action wiring. Live Salesforce queries/DML and cross-component execution remain pending.
