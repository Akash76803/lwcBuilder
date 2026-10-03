# Screen Builder foundation — visual phase

## Delivered

36 registered types in Layouts, Inputs, Actions, Data, Record Forms, Feedback, Files and Custom categories. The registry in builderModel owns labels, defaults, property editors, binding kinds, event names and child placement rules. Existing project schema version 1 and Data Packs remain intact.

Component-specific property editor: input types/defaults/placeholders/required/disabled, textareas, static options, button variants, grid/form columns, grid gaps, record/field API names and visual configuration for remaining types. Grid columns, gap, padding, input types and static options render in the canvas. Duplicate stays beside the original in the same parent; duplicates receive fresh IDs. Tree nodes can be dragged to a container or root. Moves reject cycles and incompatible parents before removal. Add from palette uses the selected container or selected leaf's parent. Undo/redo and JSON Save/Open preserve configuration.

Tabset accepts Tab children; Accordion accepts Accordion Section children; Record Edit Form accepts Input Field or Button; Record View Form accepts Output Field. Structural children require the matching parent and cannot be placed at root. Existing legacy tab layouts still import. In design all tabs remain accessible; preview tab buttons switch content. Accordion sections collapse in Preview.

## Acceptance in Dev Org

1. Pull testing and deploy **all** force-app/main/default/lwc, including builderPropertyEditor. Keep existing Apex/schema service permissions.
2. Open an existing saved project. Verify Data Packs, sample binding and previous canvas content survive.
3. Add Section → Responsive Grid. Set columns 3 and gap 16. Add Input, Combobox and Button into the grid. Verify same-parent insertion when a leaf is selected.
4. Set Input type date, label, default, placeholder and required/disabled. Switch component selection; verify the editor changes and properties persist.
5. Set Combobox options on separate lines; verify hardcoded warehouse options no longer appear.
6. Add Tabset → two Tabs → nested controls; use Preview to switch tabs. Add Accordion → two Sections and expand/collapse in Preview.
7. Add Record Edit Form → Input Field + Button. Reject Output Field there. Add Record View Form → Output Field. Reject an Input Field at root or inside a Section.
8. Duplicate a nested field. In Tree check fresh ID and identical nesting depth. Drag it to its valid parent, then attempt an invalid parent; verify no disappearance. Reject moving a parent into its descendant.
9. Move up/down, delete, undo and redo. Export and reopen JSON; verify all configuration and Data Packs survive.
10. Check narrow canvas layout and full-width properties controls; inspect Salesforce console for errors.

## Explicit boundaries and next increments

This is a configuration and sample-rendering foundation, not the completed Screen Builder. Input, Product Search and Price Editor now use actual lightning-input; other previews still use native HTML controls where noted. Lookup now has local sample search/select/remove; file upload and spinner remain labelled visual placeholders. No live record queries, uploads or writes occur. Dual Listbox currently previews as a multi-select; Rich Text previews as a textarea. Modal is an inline design container; popup form configuration and execution remain next work. Form modes/API names, icon size, modal size, file accept and other adapter-specific options are saved where full preview adapters are not yet available. Width/accent configuration is retained from the existing builder but not applied to all previews.

Datatable still uses existing sample rows or Data Pack output; column editor, editable drafts and bulk-save configuration remain next. Record field API names are manual configuration pending schema-backed form field editor. Multiple-screen manager, nested conditions, visual event/action editor, toast/confirm actions, live base-component adapters and Salesforce runtime are subsequent increments. Existing demonstration buttons still use the sample popup action; registry event names are configuration contracts, not active communication.

Local validation: 29 model tests and 24 LWC source files compile; compiled-app mocked DOM smoke verifies palette, grid properties, static options, date input, form child insertion, same-parent duplication, draggable tree and Data Packs navigation. Actual Dev Org deployment and visual UAT remain pending.

## Input corrections and validation

Toggle renders using lightning-input type toggle (active/inactive labels configurable); Search uses type search with Salesforce search decoration. Existing datetime-local configuration maps to lightning-input datetime. New Phone choice maps to tel plus a 10-digit pattern. Tel supports digits, spaces, parentheses, hyphens and an optional plus sign through its default pattern; custom regex can override this. Text formats: any, ASCII letters/spaces, alphanumeric/spaces, digits, or custom regex without slash delimiters. Email and URL validate format; custom pattern can add restrictions. Numeric fields support min/max including zero and negative bounds, step (1 default) or any. String types support min/max character counts; dates/times support range bounds. Boolean defaults use a checkbox editor. Optional limits remain blank instead of silently becoming zero.

Properties hide inapplicable rules by type. Invalid regex, reversed ranges and invalid increments block configuration/import. Non-empty default values must pass active validation; a type change clears an incompatible default and resets text format/custom pattern. Empty defaults are permitted while configuring required fields. Invalid runtime values show custom or default error text on change/blur and do not emit previewchange. Users may type incomplete values before validation; this is field validation, not keystroke masking or record-save enforcement. Validation does not execute Salesforce DML or cross-field rules.

UAT: Toggle visually appears as a switch; Search shows search icon. Number min 0/max 10/step .25 rejects -1, 11 and 1.1; accepts 1.25. Text min 3/max 6 and letters rejects too-short/too-long/numeric input. Phone rejects letters and non-10-digit values; Tel allows international punctuation. Email rejects invalid address and displays configured custom message. Date bounds, required checkbox, disabled state, save/open and type switching must be checked in Dev Org. Local evidence: 36 tests PASS, 24 source files compile, compiled app with mocked base input verifies type wiring, conditional properties, zero min, default rejection, custom errors and invalid-event gating. Salesforce base-component visual rendering is pending Dev Org UAT.

## Lookup and multiple selections

Inputs palette contains Lookup (existing lookup type upgraded), Multi-select Lookup and Multi-select Picklist. All offer local search, selected pills, removal, empty-results state, disabled/read mode, selection counts and required messages. Multiple selectors configure minimum/maximum selection counts; selected records are excluded from lookup results and duplicates are prevented. Picklists support checkboxes, Select visible and Clear; Select visible rejects a batch exceeding the limit. Defaults and settings survive JSON Save/Open; interactive Preview selections are session state, not saved defaults. Removing a required selection emits the cleared value with validity information and displays its error, rather than retaining a stale selected record. A public reportValidity method prepares form integration; form submit engine remains pending.

Lookup Properties: object API name is saved context only; Record ID field, Display field path and Secondary field path read configured sample JSON rows. Dotted parent paths supported. Replace sample records or bind a published Data Pack List; binding supplies sample rows without overwriting the selected ID(s). Object selection and record search do not query the org in this phase. Multi-select defaults may use JSON arrays or comma-separated values; scalar defaults for Lookup. Unknown saved IDs render as removable fallback pills; selecting current source records yields current labels.

Picklist options: one option per line, either plain label or API-value|Display label. A bound List may be strings or objects with value/label keys. This is a multi-value selection UI, not automatic Salesforce field-picklist metadata retrieval or multi-record DML.

Dev Org UAT: add all three types; search by primary/secondary text, select/remove, verify no duplicate warehouse, picklist select/clear, no-results, required messages, disabled, min/max limits, defaults and Save/Open. Configure two records with nested Account.Name, then bind a published sample List and verify replacement of sample rows. Verify empty/invalid source messages. Preview emits scalar ID/null for Lookup and value arrays for multiple selectors; communication execution remains separate.

Local evidence: 41 model tests, 27 compiled source files, compiled-app selection smoke with mocked Salesforce input/icon. Actual Dev Org rendering and UAT pending.

## Compact selection layout

Lookup, Multi-select Lookup and Multi-select Picklist now share a single-line closed control: first selected pill, +N overflow count, search and dropdown arrow. Results, full selected pills, picklist tools and selected count render only while the dropdown is open. All selections can be removed from the open panel; closed first-pill removal remains available. Single lookup closes after selection. Done/Escape return focus to the arrow, outside pointer click closes the dropdown. Tab/focus changes within the selector do not dismiss it; use Done, Escape or an outside pointer click. Search focus/input or ArrowDown opens it. Disabled/read mode blocks opening and editing. Listeners are removed on component disconnect.

No project migration or data-provider changes. Configured defaults persist; interactive choices remain sample session state. Object API name is still saved context only; searchable object selection/source enforcement is pending separate work.

Local checks: 27 files compile, compact compiled-app interaction smoke PASS (all three types, collapsed initial state, count, remove, search, Done, Escape, outside click and clear). Model suite remains 41 tests. Dev Org UAT must check narrow columns, long selected labels, click/Tab inside dropdown, overlapping neighboring inputs, bottom-of-canvas/Preview scrolling and clipping; visual layout was not verified in a real Salesforce browser.

### Selection click regression fix

Removed focus-out dismissal and changed outside-pointer detection to mark events received inside the selector. This prevents a retargeted focus transition from removing choices before their click/change handler runs. Local compiled-DOM regression simulates focusout to the component host between pointerdown and click for lookup and picklist; selection remains available. All three selector interactions pass locally. Salesforce Dev Org verification is still required; the reported org failure has not been reproduced locally.

## Custom table designer — Phase 1 sample runtime

The existing Datatable now renders configurable columns rather than fixed markup. Select the table, then Properties to open Cell / Design / Calculate / Rules. Changes stay in an editor draft until **Apply table**; export/save JSON after applying. Canvas header clicks select the corresponding column. Applying settings, changing binding/sample rows, or Undo resets transient row edits and selection. Project JSON preserves definitions, not transient row data. Existing projects without tableConfig receive defaults; tables with bound Lists derive initial columns from sample nested scalar fields.

- **Cell:** Add/remove/reorder columns. Choose field, input or calculated source; nested Data Pack/sample field dropdown; row input key; text/number/date/checkbox/email/tel; defaults, required, numeric min/max; visibility, header group, 60–600 px width and alignment. Input keys must be unique simple names. References must be removed before deleting a referenced column.
- **Design:** Grouped contiguous headers, compact/comfortable density, grid lines, alternate row backgrounds and none/single/multiple row selection. Group headers split when the same group is separated by other columns.
- **Calculate:** Generic add/subtract/multiply/divide column operands, including dependency columns. Optional discount roles on bound/input columns (amount or percent); quantity × price base; original gross or sequential remaining base in column order. Add totals creates gross, total amount, effective percent and net calculated columns plus 100%/nonnegative-net row rules. Monetary operations round to two decimal places. Hidden discount columns still participate.
- **Rules:** Enabled/disabled numeric same-row comparisons against another column, a nested field or constant. lte/lt/gte/gt/eq; custom messages with {value}/{limit}; block or warn. Discount and net rules require discount calculation enabled. Numeric/type/calculation errors block independently of optional rules. Negative discount input is invalid. Exactly 100% is allowed; positive amount discount on zero gross is invalid and avoids division by zero.
- **Preview output:** sample cellchange / rowselection / save emit all merged rows and selected rows into Preview state, including numeric typed inputs and calculated columns. This does not execute cross-component connections, DML, Apex or live Salesforce queries. Row edit/add popup, lookup/picklist cells, sorting/pagination, advanced expression/condition groups and custom cell adapters remain future work.

### Dev Org UAT

1. Pull testing and deploy the entire LWC directory (three new bundles are required). Refresh the page. Select Datatable → Properties → + Add column. Bind HSN or another nested field; Apply table; verify correct row values. Bind a published Data Pack List via Bindings and confirm its output fields are offered, including nested paths even without sample rows.
2. Add Remarks text input and a checkbox; verify per-row inputs/defaults. Add a number input and its limits. Apply, Preview, select multiple rows, save; inspect sample behavior. Save/Open JSON, Undo/Redo and revision restore must preserve the applied configuration.
3. Add quantity ≤ stock rule; 50 vs 48 shows row error and blocks Save. 48 passes. Toggle rule off; choose warn; custom text replaces placeholders. Test zero/empty values, missing fields and rules against constants/other columns.
4. Set quantity 10, price 100. Add 20% + ₹300 + 10% + ₹450 discounts; enable same base and add totals/rules. Expect ₹1050 / 105% / −₹50 and blocked Save. Change ₹450 to ₹400: ₹1000 / 100% / ₹0 is valid. Test sequential mode and zero base as well.
5. Check nested tables, Preview dialog width, horizontal scrolling, grouped headers, alignment, hiding/reordering, narrow inspector and keyboard interactions. Salesforce visual/layout UAT is pending.

Local evidence: **49 Node tests PASS**, **34 LWC source files compile**, compiled-app DOM smoke PASS for adding HSN, applying, header selection, stock 50/48 validation, four mixed discount inputs, totals, 105% blocked / 100% allowed and Undo. These are local checks, not a Salesforce deployment/UAT result.

## User-defined formula columns and formula row rules — 2026-10-03

Calculate → **+ Formula column** adds a numeric calculated column. Cell → Formula accepts clickable `[Header]` tokens, numeric literals, parentheses, + / − / * / ÷, comparisons (=, !=, <, <=, >, >=), AND / OR / NOT, TRUE / FALSE, ROUND, IF, SUM, MIN and MAX. IF and logical operators evaluate lazily. ROUND precision is 0–8. Arithmetic retains 15 significant digits to remove common binary floating noise; currency precision is explicit via ROUND, rather than automatic two-decimal rounding on every formula operation. GST percentage input must be numeric 18 for 18%, not the text `18%`.

**Apply table** parses text to a validated expression tree with stable column IDs; header rename and column reordering preserve applied references. Formula drafts are not persisted before Apply. Ambiguous duplicate header labels cannot be typed as references; use distinct labels. Parser limits: 4096 characters / 512 expression nodes / nesting 50. Missing references, invalid function arguments, invalid syntax and dependency cycles reject Apply/import. JavaScript code is not executable. Rule expressions must return boolean and column expressions numeric. Runtime division-by-zero/missing numeric inputs show row errors and block Save; a failed validation condition may instead warn if configured. Hidden formula columns continue to compute.

Inputs recalculate all dependent formulas and rules on **input**, including before blur. Rules → Add row rule defaults to kind formula; enabled, effect and message are editable, and header tokens can be inserted in its condition. Legacy two-column calculations and compare/discount/net rules remain supported.

### A/B pricing configuration for UAT

Create the following headers exactly (or insert your own tokens). Input/bound numeric headers: Unit Price, Qty, My Stock, Discount 1, Discount 2, Discount 3, GST. All three discounts below are percentages on the original Basic Value.

| Calculated column | Formula |
| --- | --- |
| Basic Value | `[Unit Price] * [Qty]` |
| Discount Amount | `[Basic Value] * SUM([Discount 1], [Discount 2], [Discount 3]) / 100` |
| Total Discount % | `IF([Basic Value] = 0, IF([Discount Amount] = 0, 0, 101), [Discount Amount] / [Basic Value] * 100)` |
| Taxable Amount | `ROUND([Basic Value] - [Discount Amount], 2)` |
| Total GST | `ROUND([Taxable Amount] * [GST] / 100, 2)` |
| Final Amount | `ROUND([Taxable Amount] + [Total GST], 2)` |

Rules (formula kind, enabled, block): `[Total Discount %] <= 100`, `[Qty] <= [My Stock]`, `[Taxable Amount] >= 0`. Add numeric minima/required settings or formula rules for nonnegative inputs as your business requirements need. Calculation definitions do not automatically install business rules.

- A: 231 / qty21 / stock50 / discounts12,31,66 / GST18 → Basic4851, discount109%, invalid. Change discount3 to56: taxable48.51, GST8.73, final57.24, valid.
- B: 213 / qty32 / stock30 / discounts23,14,0 / GST18 → taxable4294.08, GST772.93, final5067.01; stock rule blocks. Change qty to30 and confirm immediate recomputation.
- For Discount2 amount based, change Discount Amount to `[Basic Value] * ([Discount 1] + [Discount 3]) / 100 + [Discount 2]`. Total Discount % continues using the combined amount and zero-base guard.
- Rename a referenced header, reorder columns, export/open JSON, Undo/Redo, toggle rule enable/warn and verify persistence. Test an unknown header, cycle and divisor zero. Check token insertion cursor placement and keyboard on Salesforce.

Local validation: **56 Node tests PASS**, **34 LWC files compile**, compiled DOM formula smoke PASS (add/apply, immediate recalculation, rename, cycle rejection, formula stock 50/48); legacy custom table smoke PASS. Salesforce UAT remains pending. No live query, DML or cross-component execution is added here.

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

## Seven-section datatable editor and runtime output packs (2026-10-03)

The table editor now uses Source & Identity, Columns & Cell, Formulas, Design & Totals, Validation, Events & Actions, and Output Packs. Cart and Summary remain separate components. Existing formulas, mixed discount calculations, validation messages, totals and undo behavior remain supported.

Set a unique source field (usually Id) or composite key in Source & Identity. Temporary keys are session-only and unsuitable for durable record identity. Missing/duplicate keys block row operations. Edits and selection follow stable keys across sorting and source reorder. Design supports optional sorting and pagination; totals cover the configured full/selected dataset rather than the visible page.

Output Packs supports snapshots of all, selected, changed, current or condition-matching rows, and action-managed packs. Events supports cell change, row selection, row action and Save; actions support keyed upsert, remove, replace and row-details popup. Optional Boolean formulas filter actions; selection actions can distinguish select from deselect. Require-valid guards prevent invalid rows entering action packs. Payloads contain rowId, full current row (including formula output), values, issues, selected/changed rows and named output packs. Row data and metadata are kept separate.

Example: create an action-managed `items` pack, configure Cell change → Upsert → items with `[Quantity] > 0`. Quantity 3 → 4 updates the same item. Add a Remove action with `[Quantity] = 0` when zero should remove it. This creates local runtime data only; no Salesforce write or automatic cart-card rendering.

Verification: 68 Node tests pass; LWC bundle compilation and DOM checks pass for seven sections, action-pack creation, full-row recalculation 300 → 400, deduplicated upsert, source reorder, sorting, selection, duplicate-key blocking, existing stock 50/48 rules, discounts 105%/100%, totals, standalone summary, messages and move/delete/Undo.

Dev Org UAT: deploy the complete LWC folder; test key choice, duplicate/missing identities, filtered packs, select/deselect, zero-quantity removal, Save replacement, row-details popup, multipage selection/totals, JSON save/reopen and legacy projects. Org UAT is pending. Configuration persists in project JSON; edits, selection and runtime output packs are session-only. Salesforce querying/DML and general cross-component communication are future work.

## Behavior core refactor 2026-10-03

Baseline f9cc872: 68 Node tests. Final: 121 Node tests pass, including all original 68, 37 registry adapter contract cases, typed expressions, graph/store/router/executor/migration contracts and frozen pre-refactor table-to-summary goldens for stock 50/48 and mixed discounts 105%/100%.

New service modules: builderExpression, builderDependencyGraph, builderStateStore, builderEventRouter, builderActionExecutor, builderMigration, builderRegistry, builderValidation and builderRuntimeCoordinator. Legacy builderModel and builderTableModel APIs remain available as re-exports. Numeric formula parsing/coercion/rounding remains unchanged; strict Number/Text/Boolean/ISO Date behavior uses the separate typed expression API. Shared graph validates formula and computed-state dependencies. Core action chains are synchronous and support stop/continue errors; the table and executor share keyed collection operations.

The shell no longer owns runtimeTables or summary-injection logic. Adapter contracts route table/selection transport events through a generic adapterevent envelope and router. Runtime packs live in the state store scoped by Design/Preview, node ID and pack name. Summary subscribes to the store through the compatibility coordinator. Existing sourceTableId summary configuration, fallback sample data, provisional errors, source/column removal, Preview reset and Undo/Redo semantics remain intact. Editor design/history/selection state remains in the shell; this refactor isolates runtime behavior, not all editor UI handlers.

Editor initialization, imports, restores and history transitions migrate v1 definitions to v2 with empty state/events/actions sections. Existing fields and stored revision snapshots are preserved. No new UI is exposed. JSON exports now use schemaVersion 2; a v1 JSON opens with the same nodes/configuration. Unknown future schema versions fail clearly. New sections are infrastructure only; stored action/connection configuration is not silently activated.

Compiled LWC bundle and existing formula/table/aggregate/compact-selection/input/runtime DOM checks PASS. New tests/dom/check-behavior-core.cjs verifies v1 import/v2 export node parity, unknown-version rejection, Preview 0→7, isolated Design value 4, and Preview reopen reset to 0. It requires jsdom and a compiled builder bundle; set LWC_BUILDER_DOM_BUNDLE to the absolute bundle path. Node service imports use tests/registerServices.js through npm test; direct node --test must also supply --import ./tests/registerServices.js.

An obsolete pre-compact check-selection.cjs outside the repository fails by clicking a closed dropdown. The exact failure was reproduced against baseline f9cc872; assertions were not weakened or edited. The current check-compact.cjs regression remains green. No org deployment, new Apex or main update was performed.

Follow-ups: general Binding resolver with typed source/target contracts; visibility/cross-field/date rules using shared expressions; live permission-aware Data executor and async provider actions; persistent org storage and activation; reproducible CI for compiled DOM tests. Current coordinator intentionally preserves legacy Summary bindings rather than exposing new binding controls.

## Tabset working behavior — 2026-10-03

- A new Tabset starts with Tab 1. Add Tab works on the canvas and inspector; tabs remain explicit child nodes.
- Design shows one active tab canvas. Clicking a tab or selecting its descendant in the Tree opens that panel; controls added/dropped into the tabset target a tab rather than root.
- Inspector exposes tab labels, Open, Move up/down, Delete tab and Default Tab. Existing component Delete, Duplicate, Undo/Redo and JSON export remain available. Duplicate translates stored default IDs.
- Preview uses the stored default (or first available tab), respects existing Visible rules and the tab's Disabled flag, and supports Arrow Left/Right, Home/End navigation. Design can inspect disabled/hidden tabs. Empty sets show an empty state.
- Inactive tab panels stay mounted using hidden containers, preserving table edits and selections when switching. Identity uses node IDs, independent of labels and order; deleted/moved defaults fall back gracefully.
- Deferred: active-tab State binding, configurable tabChange actions, new condition editor and Salesforce live execution. This change does not implement those mockup controls.
- Verification: 125/125 Node tests; LWC compilation PASS; compiled Tabset DOM checks cover creation/add/nesting, rename/reorder/default, delete/Undo, keyboard, drop target, disabled fallback, copied defaults and Design/Preview table edit preservation. Existing formula, table, aggregate, compact selector, typed-input and behavior-core DOM regressions PASS. No org deployment; org UAT pending.
- Manual UAT: add Tabset → Add Tab → drop Datatable into Products → edit/select rows → switch away/back → set Products default → Preview → rename/reorder → delete/Undo → export/import JSON. Confirm hidden/disabled fallback with the existing Rules editor.

## Service bundle deployment packaging fix — 2026-10-03

The ten behavior/registry/tab JavaScript modules were already tracked on testing, but their Salesforce .js-meta.xml files were omitted. Added matching LightningComponentBundle metadata for builderActionExecutor, builderDependencyGraph, builderEventRouter, builderExpression, builderMigration, builderRegistry, builderRuntimeCoordinator, builderStateStore, builderTabModel and builderValidation (API 66.0, isExposed false, matching existing service bundles). No HTML is needed for these API modules.

Verification: all metadata parses as XML; every LWC folder has matching JS/metadata; all local c imports/template component references resolve to complete bundles. 127/127 Node tests PASS (125 prior tests preserved). This is a local packaging verification, not an org deployment result. No org deployment performed. Pull testing and include the complete force-app/main/default/lwc source directory in the next user-run deployment; deploying only lwcBuilder/builderNode excludes their dependencies.

## Value Binding / Screen State — 2026-10-03

- Added builderBindingResolver (pure JS) and builderBindingEditor (UI), both with Salesforce bundle metadata. Bindings tab now offers Static Value, State variable, and published Data Pack field for applicable value components. Existing unmarked pack bindings retain their legacy behavior.
- State definitions live in project.state.variables as safe unique keys, type and defaultValue (up to 100). Types: Text, Number, Boolean, Date, List, Object. The UI filters compatible variables for a selected component; scalar output fields/badges can show Text/Number/Boolean/Date. Existing Properties edits configure static defaults; badges/pills now expose a default value.
- State bindings live in node.data.valueBinding = {source:'state',key:'quantity'}; explicit new Pack value bindings use {source:'pack'} alongside existing data.packBinding. Incomplete choices show a visible binding error. Removing an in-use variable or changing an input to an incompatible type is rejected atomically.
- Valid State-bound edits propagate through the pure StateStore to other controls using the same key. Number/Boolean/calendar Date types are enforced; multi-lookup/multi-picklist selected IDs use List. Lookup record/options packs stay independent of selected-value binding. State updates preserve an open multi-selection menu.
- Design and Preview have separate state sessions. Preview reopen/import/Undo/Redo resets runtime state; changing variable definitions/defaults resets sessions. Save/export contains definitions/defaults, never runtime edits. Variable current values are shown in the inspector. Legacy label-based Preview state remains available; existing Visible rules may reference variable keys.
- Pack values read published sample output, with typed conversion/error feedback for explicit new value bindings. This phase does not write back to Data Packs or execute live Salesforce data.
- Verification: 135/135 Node tests (all prior 127 retained), metadata/dependency completeness checks, LWC compilation and binding DOM tests PASS. DOM coverage: UI creation/defaults, typed variable filtering, input/textarea/output communication, Number/Boolean/Date, multi-lookup List selection, Static/Pack switching, published Pack dropdowns/type errors, guarded deletion/type changes, JSON persistence/import reset, Preview isolation/reopen. Existing formula/table/aggregate/compact/input/migration/Tabset regressions PASS. No org deployment performed.
- Manual UAT: add two Text inputs → Bindings → create customerName Text → select State/customerName for both → edit first → verify second. Try Number quantity with empty/invalid values; Date startDate; multi-lookup selectedIds List. Verify lookup options still use their own Pack. Preview and reopen; export/import. Bind a published Pack scalar field and check incompatible Number output feedback.
- Next phase: configurable Event/Action UI (including tabChange), active-tab binding, typed cross-component/date validation, computed-variable editor and the live Data executor. Object variables are defined for later mappings; value controls bind scalars or selected-ID Lists in this phase.
