# LWC Builder Phase 1 UI

Version 0.1.0 — 1 October 2026. Native Salesforce LWC source package matching the approved blue/white editor layout. This delivery is the first interactive UI implementation; full Phase 1 acceptance remains pending compiler and Dev Org UI verification and the gaps below.

## Install in your Dev Org

Install Salesforce CLI on your machine. Extract this folder and open it in VS Code. From the project root:

```powershell
sf org login web --alias LwcBuilderDev --set-default
sf project deploy start --source-dir force-app --target-org LwcBuilderDev
```

In Salesforce Setup, open Lightning App Builder, create an App Page, choose a full-width single region, drag **LWC Builder** into it, Save and Activate. Open it from your Lightning app navigation. Deploying the builder does not deploy any generated project.

## Working UI

Component palette, search, tree, recursive nested canvas, selected inspector, add by click/drag, duplicate/delete/reorder/move, bounded undo/redo, project naming and targets, configuration editors for data/rules/connections/actions, action ordering, version snapshots, JSON export/import, preview with sample visibility rules, popup form demo, AI demo messages and diagnostic trace. Sample Order Workspace ships as the default project.

Save JSON creates a downloadable file. There is no localStorage dependency or Salesforce server persistence. Keep the exported file; reopening the page resets unsaved state. Open imports a JSON definition up to 2 MB. Versions are included in exported JSON, with up to ten snapshots.

## Explicit demo boundaries

No org schema query, business record reads/writes, Flow/Apex execution, AI request, code ZIP generation or authenticated deployment takes place. Generate & Deploy opens an explanatory modal. The AI panel returns a demo message and never claims changes were applied. Table rows are sample display data; the popup is a demonstration and does not update them. Child LWC is a placeholder until an adapter is registered.

Data/relationship and communication fields currently accept typed configuration. They are not yet validated org-backed dropdowns. Rules support flat AND/OR Visible expressions in listed order; nested groups, editability/required execution and custom expression functions are follow-up work. Actions preserve type/name/error configuration; branching input/output mapping and full action diagrams are not yet implemented. Tabs and modal canvas blocks show structural containers, not fully configured runtime navigation. Variant, width and accent fields are preserved; padding, labels and values are rendered. Full design-system coverage remains pending.

## Tests

`npm test` runs meaningful project model tests. It does not prove LWC compilation or browser interaction. See QA.md for actual checks performed and pending items. Use TRACKER.md for current delivery status.

## Org UAT checklist

1. Verify the full-width editor, selection outline, panels and small-screen wrapping.
2. Add section, grid and form nodes; nest an input; move and reorder through the tree.
3. Undo/redo, duplicate/delete; export then import and compare the entire design.
4. Add/edit/remove rules, communication mappings and actions; reorder actions.
5. Save two snapshots and restore one.
6. Preview and change Order Status to Submitted: Order Items hides; return to Draft: it shows.
7. Try a malformed or duplicate-ID JSON file; import must reject it.
8. Verify AI and deployment buttons clearly report demo/pending status.

No org credentials are included. APIs use version 66.0 as a conservative initial baseline; confirm it against your org before deployment.
