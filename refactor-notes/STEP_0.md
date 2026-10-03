# Behavior core inspection
Baseline testing f9cc872; 68 Node tests pass, 0 failures (2026-10-03).

Actual source: native LWC renderers/editor plus pure builderModel, builderDataPackModel, builderSchemaModel and builderTableModel. Eleven Node test files. QA markdown is chronological, not a single current capability matrix.

builderTableModel: tokenizer/parser/AST validation/formatter/evaluator; validateTableConfig graph walk for legacy and formula operands; evaluateTableRow recursive busy-set guard; row rules and pack conditions call the formula engine. Table collection operations are inline in buildTableEvent.
builderModel: registry/property defaults/containment, input/selection/project validation, tree helpers and flat visibility rules.
lwcBuilder: runtimeTables keyed by design/preview + ID; signature invalidation in mutate; reset on undo/redo/Preview; fallback tableRuntimePack; summary injection in boundNodes. builderNode.tableChange forwards tableoutput plus previewchange. builderSummary only consumes injected data.

Correction: parser/evaluator alone does not reject dependency cycles; configuration graph and runtime recursive guards do. Current Summary uses rows or selectedRows, not arbitrary named action-managed pack consumption. Tests directly import pure modules; c service aliases require a Node resolver after extraction. 37 registry types exist.

Files proposed: builderExpression, builderDependencyGraph, builderStateStore, builderEventRouter, builderActionExecutor, builderMigration, builderRegistry, builderValidation, builderRuntimeCoordinator service modules; tests for behavior contracts and a service resolver; changes to existing table/model/node/summary/shell integration and QA. No Apex or UI design changes.

Assumptions: Date means ISO calendar date. Pack names scoped by design/preview and node ID. Migration adds state={}, events=[], actions=[] without changing other fields; old public model validation remains compatible with v1. Core action chains synchronous; async provider execution follows later. Existing preview/reset/signature semantics retained.
