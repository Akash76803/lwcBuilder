# Behavior core API

Pure LWC service modules have no Lightning, DOM or Apex imports.

- builderExpression: parseExpression(text, references), evaluateExpression(ast, get, types), assertType. Typed Number/Text/Boolean/Date comparisons; DATE("YYYY-MM-DD") produces Date. Table parser/evaluator/formatter/AST-reference functions retain their names and legacy numeric behavior. Object/List types support internal runtime state, not scalar arithmetic.
- builderDependencyGraph: topologicalOrder([{id, dependencies}], options). Missing references, duplicate IDs and cycles reject.
- builderStateStore: createStateStore(definitions). Specs use key/type/kind/defaultValue or kind=computed/expression. read/write/reset/subscribe, version/expectedVersion and defineMany. Writes validate and recompute before committing; computed state is read-only. Reads copy data. Runtime state is never serialized into the project.
- builderEventRouter: createEventRouter({store,maxDepth}). register(node,event,handler,when); dispatch(node,event,payload,context). Origin survives nested dispatch; active context wins over supplied context and maximum depth stops loops. when references typed store keys and must return Boolean.
- builderActionExecutor: createActionExecutor(store).execute(actions, context). Results are {ok,result} or {ok:false,error}; default error policy stops. setState/resetState and collectionUpsert/Remove/Replace use key/value/entries/rowKey. applyCollectionAction is shared with buildTableEvent and retains position on keyed replacement.
- builderMigration: migrate(project) clones v1/v2; v1 becomes v2 and adds missing state={}, events=[], actions=[]. Existing fields, including snapshots, are preserved. Future versions reject.
- builderRegistry: definitions, defaults, containment, adapter.propsIn/eventsOut/commands. Registry event names are logical contracts; tablechange/selectionchange are adapter transport envelopes. Commands remain empty.
- builderValidation: legacy input, selection, project and visibility validators. builderModel re-exports old names.
- builderRuntimeCoordinator: store/router ownership, scoped output publication, signature invalidation, legacy Summary compatibility view and keyed subscription lifecycle. Existing sample-binding resolution remains in builderDataPackModel and the editor; a general Binding resolver is deferred.

Assumptions: core actions are synchronous; Date is a validated ISO calendar string; names are scoped by mode/node to prevent collisions; existing editor UI methods/history remain shell-owned. Old project connections and actions remain inert. No new Salesforce execution is enabled.

Baseline report: STEP_0.md. Verification: SCREEN_BUILDER_QA.md. Golden fixtures were generated from f9cc872 before extraction, not regenerated from refactored output.
