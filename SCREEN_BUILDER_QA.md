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
