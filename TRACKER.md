# LWC Builder tracker

| Phase | Purpose and scope | Status | Testing | Deliverable | Next |
|---|---|---|---|---|---|
| Scope | Complex visual Salesforce builder, technical design | Documented | Salesforce platform docs reviewed | SOW v1.0 | Feasibility in Dev Org |
| Phase 1 UI | Entire editor shell, nested canvas, configuration panels, sample preview | Initial implementation delivered; full acceptance pending | 6 model tests pass; compiler check recorded in QA; org UAT pending | Source package 0.1.0 | Deploy and inspect approved layout; close UI gaps |
| Phase 2 Data | Live schema, fields, relationships, editing/persistence | Planned | Not run | None | After UI validation |
| Phase 3 Behaviour | Typed adapters, rules, Flow/Apex and communication | Planned | Not run | None | Build on accepted model |
| Phase 4 Generate | Source generation and authenticated deployment | Planned | Not run | None | Build after behaviour contracts |
| Phase 5 AI | Structured prompt authoring and catalogue expansion | Planned | Not run | None | Connect validated generator |

Remaining Phase 1 work: org-backed field selector presentation with sample schema, nested condition-group UI, typed property controls, full action parameter/branch editors, binding selector, component registration dialogs, full preview editing, focus/keyboard modal behaviour, final visual parity and org UAT. No completion percentage is claimed before these pass.

## User verification and repository workflow

1 October 2026: Akash deployed version 0.1.0 to the current org, created the page and confirmed rendering and tested interactions as working. This is user-reported UAT evidence; advanced editor coverage remains pending.

Repository: https://github.com/Akash76803/lwcBuilder
Baseline goes to main; subsequent changes go to testing and reach main through a reviewed PR after automated checks and relevant Dev Org UAT. The next change is the visual object/field/relationship picker.
