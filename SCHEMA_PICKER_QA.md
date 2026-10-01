# Org metadata picker — testing branch

Implemented: live object API-name search with paging, readable field selection, parent lookup traversal (up to five hops), and related child source configuration. Selection participates in builder undo/redo and JSON export/import. CRUD/FLS describes hide inaccessible metadata; permission set grants service class access without granting object permissions.

## Deploy and test

Use your existing Salesforce CLI org alias in place of DEV_ORG:

```sh
git checkout testing
git pull origin testing
sf project deploy start --source-dir force-app --test-level RunSpecifiedTests --tests BuilderSchemaServiceTest --target-org DEV_ORG
sf org assign permset --name LWC_Builder_Admin --target-org DEV_ORG
```

1. Reload Builder, select a table or form, open Data or Bindings.
2. Search Contact, select Contact and check Name / Email. Check field search by label and API name.
3. Explore Account, select Name. Selected fields must contain Account.Name. Back must return to Contact.
4. Explore another single-target custom lookup and select a target field. Polymorphic lookups stay disabled with an explanation.
5. Select Account, then its Contacts child relationship. Source becomes Contact and stores AccountId = context.recordId.
6. Undo/redo the source change, export JSON, then import it. Object and selected paths must be preserved.
7. Test an inaccessible field/object with a restricted user who has service permission. They must be absent; no-access errors must appear in the panel.
8. Search nonexistent API name; retry valid search. Test paging and large custom objects.

Local validation: nine Node tests and eleven LWC source files compile. Apex tests are supplied but must run in the Dev Org; there is no authenticated org in this workspace. Visual browser QA is pending in the org.

## Current boundaries and next action

Metadata only: canvas rows remain sample data. No SOQL or DML executes. Related source stores a current-record binding; runtime context resolution follows in Phase 2. Filter remains the existing text configuration; visual conditions are the next UI task after picker UAT. Polymorphic typed queries, field reordering, query validation, live forms and bulk saves remain pending. Imported metadata bindings are checked by the runtime in a future phase, not trusted as executable queries.

## Field picker layout fix

The 300px inspector now shows a compact source card with a Change action. Object search is collapsed after selection. Fields / Parent / Child use separate tabs, with scrollable lists, field type badges, selected count, remove buttons, and explicit empty/loading/error states. Advanced filters are collapsed. Search relationships by label or relationship name. Clicking the existing source no longer clears bindings.

Retest at desktop and narrow page widths: long custom labels/API paths must wrap without horizontal overflow; open Change and choose an object; toggle fields; browse Parent then Back; switch to Child; remove a selected field; verify undo/redo and JSON export. Local checks: 9 model tests pass; 11 LWC files compile. Compiled LWC mounted in jsdom with mocked metadata: collapsed object list, tabs, lookup/back, selection deduplication, same-source preservation and removal pass. This does not measure layout or verify Apex. Browser download was blocked by the network allowlist; Dev Org visual verification is pending.
