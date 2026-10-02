# Data Pack Designer — Phase 1 working UI

This workspace extends the existing builder. It does not replace legacy object/field bindings. Pack definitions, draft sources, output mappings, published sample versions and component bindings are stored in the project JSON. Save JSON from the toolbar and reopen it later. There is no Salesforce server persistence yet.

## Implemented

- Data Packs navigation; blank pack and CustomerWorkspace sample template; multiple packs.
- Text/Number/Decimal/Boolean/Date/DateTime/RecordId/Email/Phone/URL/Object/List inputs with required/default values and preview overrides.
- Sources with existing live org metadata picker, selected fields, visual AND filters (input/constant), sort, row limits and sample records.
- Nested Object/List/Value output tree; rename/add/remove nodes; limits of 10 levels and 200 output nodes.
- Field/input/constant/source-count value mappings. Lists match parent record keys to source keys. Grouping objects inherit their enclosing source record.
- Validation, sample output JSON, execution row counts and local published sample snapshots (up to 10).
- Component bindings pinned to a published sample version. Tables bind lists and render generic output columns; forms show an object JSON preview; value controls show scalar values. Inputs are sample constants.
- Builder undo/redo and JSON Save/Open include all definitions. Old projects without dataPacks still work.

## Deploy

Use the existing Dev Org alias:

```sh
git checkout testing
git pull origin testing
sf project deploy start --source-dir force-app/main/default/lwc --target-org YOUR_ORG_ALIAS
```

If the earlier schema service is not deployed, deploy all force-app with BuilderSchemaServiceTest and assign LWC_Builder_Admin as described in SCHEMA_PICKER_QA.md.

## Acceptance walkthrough

1. Open Data Packs → Load Sample Template. The new CustomerWorkspace pack has one input, two sources and nested customer/contacts output.
2. Run Sample Preview: customer Acme includes only Alex, not Sam. Input recordId=a2 returns Other Customer with Sam. Nonexistent ID returns customer:null.
3. Select contacts in the tree: source Contacts; parent key Id; matching field AccountId. Edit a mapping or remove a referenced source; Validate must identify the problem.
4. Select a source: check live metadata picker; inspect sample records, visual filters and sort. Source filters are AND only. The sample interpreter never queries Salesforce records.
5. Create a blank pack. Add input/source, an Object or List and Value children. Select output type and value mapping. Incomplete draft can be retained with Save JSON; publishing must fail until validated and sample preview succeeds.
6. Publish Sample Version. Go to Data (the selected component is initially Order Items). Choose CustomerWorkspace → Version 1 → customer.contacts. The canvas table renders id/name/email for Alex.
7. Change sample input to a2 in the binding panel: the bound table shows Sam. Missing required inputs show a binding error.
8. Change the pack draft/source sample data. Existing binding stays pinned to v1. Publish v2, then explicitly change the binding version to adopt the new output.
9. Save JSON, reload the page and Open the file. Check pack definitions, snapshots and bindings. Undo/redo a pack edit from the Design toolbar. Open an older project with no packs and confirm its legacy canvas still renders.
10. Check desktop and narrow page widths, long node names, validation errors and scrollable source/preview panels in Salesforce. Retest schema picker layout and permissions.

## Validation evidence

25 Node tests pass; 21 LWC files compile; metadata XML parses; diff check clean. Compiled full app mounted with mocked Apex metadata: create example, preview, publish, component binding/table rendering, navigation persistence and input editing pass. These checks do not verify Salesforce deployment, CRUD/FLS or real org records. Local Chromium rendering could not run in this environment; desktop/narrow visual QA remains pending in the Dev Org.

## Boundaries / next work

This is a sample-executable UI foundation. Live queries, source dependency scheduling, current-user/current-record/event input bindings, registered Apex providers, reusable pack-as-source, pagination beyond sample limits, OR/nested filters, arbitrary formulas/aggregations, duplicate policies, writable forms and automatic legacy migration remain pending. Legacy settings are preserved under a collapsible inspector section.

Source counts count filtered/limited source rows, not mapped output lists. Single-record Objects reject multiple source records rather than silently picking one; no records yield null. List no-match yields []. Sample lookup fields require nested sample JSON records. Related child context metadata is not silently executed: validation requires expressing it as an explicit filter/join and clearing the unsupported context marker.

Next: Dev Org UAT of the designer/output bindings, then structured provider execution and input-context bindings. Merge testing to main only after relevant org testing.

## Expanded input types

Input defaults, preview overrides, constants and component binding inputs share typed controls. Boolean uses a True/False/Not set selector; Date uses a date picker; numeric inputs accept decimals; Object/List use JSON editors; DateTime uses explicit ISO text with timezone. DateTime normalizes to UTC. RecordId checks 15/18-character syntax only, not record existence or checksum. Phone preserves text formatting. URL allows HTTP/HTTPS. Decimal currently uses JavaScript Number precision. Picklist options, currency precision, typed list item schemas and a visual nested Object/List input editor remain pending.

UAT: edit an input and verify all 12 choices; test valid leap date vs invalid date; timezone datetime; false Boolean; nested Object and List; reject malformed JSON or wrong shape; Save/Open and check pinned bindings. Compiled mocked-app tests verify type choices, date control and JSON editing.

## Searchable field API selectors

Filter fields, sort fields, parent record keys, matching source keys and output Value field mappings now use searchable dropdowns. Root field labels/API names come from the readable org schema. Lookup paths selected in the source relationship explorer are also available. Output field mapping is restricted to selected source fields. Existing saved paths remain visible and are never silently cleared; unknown paths are marked for verification. Advanced manual entry is collapsed and checks path syntax.

Local compiled-app checks pass for metadata field labels, search, filter changes, preserving the selected field during search, restricted output choices and invalid manual path rejection. UAT: test standard/custom fields, source changes, permission failures, selected multi-hop paths and existing saved projects. No live query/path validation is claimed.

## Direct parent lookup browser

Each field selector now has **Browse fields & parent lookups**. It opens a responsive dialog with the root object, lookup path, per-level field search, parent lookup navigation, Back and clickable breadcrumbs. Select a field to preview its API path and type, then click Use Field. Cancel or Escape leaves the mapping unchanged. Parent traversal uses readable schema metadata only, with up to five hops; polymorphic targets remain disabled and are explained. Metadata failures show Retry and prevent applying a stale selection.

For output Value mappings, choosing a field through the browser also adds that path to the enclosing source's selected fields without duplicates. Filters/sort/join keys apply their chosen path without changing output columns. Root changes invalidate pending navigation.

UAT: on a Contact source browse Account → Owner → Name; selected path must be Account.Owner.Name. Use Field must update both output mapping and source selected fields. Test custom lookups, Back/breadcrumb, Cancel/Escape, search, five-hop cap, polymorphic fields and permission failures. Save/Open must preserve the new path. Sample lookup data must contain nested objects, e.g. {"Account":{"Owner":{"Name":"Alex"}}}, for sample execution. This is metadata traversal, not a live record query.

Compiled mocked-app checks pass for two-hop path construction, preview-before-commit, source selection update, Back/breadcrumb, Escape/cancel, maximum depth, polymorphic block and metadata errors. Existing compiled-app creation/preview/publish/table-binding regression also passes. Dev Org visual/permission QA remains pending.
