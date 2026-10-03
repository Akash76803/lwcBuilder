# Authoritative LWC Builder tracker

Google Sheets: https://docs.google.com/spreadsheets/d/1etAPOARs7fVSzfkZb-36j9w5jRoJI65qf8ABbEftO-Q/edit?usp=drivesdk

Keep this Drive tracker authoritative. Refresh after implementation, fixes, QA, deployment or status changes with purpose/scope, status, testing evidence, deliverable/version, blockers and the next action. Read its current contents before updating; do not replace manual edits from stale conversation context.

Current next action: Dev Org UAT of Screen Builder foundation (categorized registry, nested layout canvas, component-specific properties and sibling duplication). Then implement datatable columns and popup form editors; multiple screens and event/condition editors follow. Data Pack visual configuration remains available; live providers and runtime inputs are deferred per Akash's current scope. Code moves to main through a PR after checks and relevant Dev Org UAT. Tracker updates are made during project work; no background monitoring is configured.

### Custom table designer — 2026-10-02
- Implemented on testing: generic field/input/calculated columns; Cell / Design / Calculate / Rules editor; nested Data Pack field choices, grouped headers, per-row edits/selection, optional mixed discounts, numeric row rules and sample Save output.
- Local validation: 49 tests, 34 compiled LWC files, compiled-DOM table interaction smoke PASS. Prior selector selection fix is confirmed working by user in Dev Org.
- Next: user deploy/UAT table designer and JSON round trip; then popup form builder and row action wiring. Live Salesforce queries/DML and cross-component execution remain pending.

### Formula columns — 2026-10-03
- Implemented: clickable header tokens, safe user formulas, stable ID references, dependent recalculation on input, boolean formula row validation and persistent definitions. Includes ROUND/IF/SUM/MIN/MAX, arithmetic/comparisons/logic; legacy table calculations preserved.
- QA: 56 tests, 34 LWC files compile, formula and legacy table DOM interaction checks PASS. A/B pricing/GST, mixed amount/% discounts, zero base, rename, JSON, missing references and cycle cases covered locally.
- Next: Dev Org UAT with the user's A/B table; then popup form builder. Live Salesforce data/save and cross-component execution remain pending.

## Validation trigger and property panel cleanup — 2026-10-03
Formula row rules now default to true → error (Salesforce-style). `[My stock] < [Quantity]`: stock 10 / quantity 22 fails, 22 / 10 passes, equality passes. Existing saved formulas without a trigger also use this default; for previously authored valid-when formulas select False → show error, or invert the condition. Explicit `formulaTrigger: valid` is supported and saved. Formula evaluation errors still block. Comparison/built-in rule behavior is unchanged.
Cell holds value configuration; selected-column appearance moves to Design. Rules hides column navigation. Discount controls are confined to a collapsed optional calculator; layout and component actions are collapsed.
Validation: 57 automated tests PASS; compiled LWC bundle and formula DOM flow PASS. Next: Dev Org UAT of trigger selection, existing saved rules and property tabs, then popup form builder.

## Current-row validation messages and component actions — 2026-10-03
Messages support `{[Column label]}` for input, bound and calculated values on the same row; stable column-ID references survive rename and JSON. Unknown / ambiguous tokens reject Apply. Validation trigger unchanged. Component Move up / Move down / Delete actions visible at inspector top across Design property tabs, with existing sibling ordering and Undo.
Checks: 58 tests PASS, compiled bundle PASS; DOM validates live message Qty 50 / stock 48 and component reorder/delete/Undo. Dev Org UAT pending; next popup form builder.

## Table totals, runtime cart pack and Summary Table — 2026-10-03
Table Design → Show total row → all/selected rows; selected column appearance → none/sum/average/min/max/count. Footer cells align under their columns and use current input/calculated values. Blank values excluded; zero included; empty Sum/Count = 0, other aggregates = blank; invalid numeric values show Invalid value.
New Data palette Summary Table: choose any existing item table's runtime Data Pack or a published List pack in Bindings. selected scope represents cart selection; all includes all current rows. Add metric label/source column/aggregate using UI; optional Group by gives category/GST/product groups. Runtime pack includes edited input keys, bound nested fields and formula IDs; Inspect current runtime Data Pack shows JSON. Selection and cell changes update dependent summary immediately. Invalid source rows mark summary provisional.
Configuration persists in Export JSON; runtime selections/edits/packs are session-only and excluded from project snapshots. This is not a Salesforce cart record save or separate Add to Cart action; cart membership currently uses table selection. Opening Preview starts its own session. Source config/data changes invalidate runtime output; removed source displays an error. No general component communication engine or Salesforce DML introduced.
Validation: 62 Node tests; compiled bundle; DOM totals 2→5 and Summary cart 0→4→7→0 / all 8 PASS. Next Dev Org UAT: totals, selected/all scopes, formula inputs, grouping, empty list, JSON restore, remove source; then component communication / popup forms.
