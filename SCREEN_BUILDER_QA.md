# Screen Builder foundation — visual phase

## Delivered

34 registered types in Layouts, Inputs, Actions, Data, Record Forms, Feedback, Files and Custom categories. The registry in builderModel owns labels, defaults, property editors, binding kinds, event names and child placement rules. Existing project schema version 1 and Data Packs remain intact.

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

This is a configuration and sample-rendering foundation, not the completed Screen Builder. Native HTML controls are used for many previews. Record picker, file upload and spinner are labelled visual placeholders; no record lookup, uploads or writes occur. Dual Listbox currently previews as a multi-select; Rich Text previews as a textarea. Modal is an inline design container; popup form configuration and execution remain next work. Form modes/API names, icon size, modal size, file accept and other adapter-specific options are saved where full preview adapters are not yet available. Width/accent configuration is retained from the existing builder but not applied to all previews.

Datatable still uses existing sample rows or Data Pack output; column editor, editable drafts and bulk-save configuration remain next. Record field API names are manual configuration pending schema-backed form field editor. Multiple-screen manager, nested conditions, visual event/action editor, toast/confirm actions, live base-component adapters and Salesforce runtime are subsequent increments. Existing demonstration buttons still use the sample popup action; registry event names are configuration contracts, not active communication.

Local validation: 29 model tests and 24 LWC source files compile; compiled-app mocked DOM smoke verifies palette, grid properties, static options, date input, form child insertion, same-parent duplication, draggable tree and Data Packs navigation. Actual Dev Org deployment and visual UAT remain pending.
