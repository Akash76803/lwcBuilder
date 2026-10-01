# QA results 1 October 2026

- PASS: LWC compiler transforms 7 source files using API version 66.
- PASS: 6 Node model tests: project round trip, nested insert/remove, moves, cycle prevention, import rejection and visibility.
- PASS: Salesforce component metadata XML parses.
- Pending: Dev Org deployment, browser interaction/visual QA, Lightning Web Security downloads and recursive runtime rendering.

Compiler success is local syntax/transform evidence; it does not prove org deployment. Reproduce: npm ci; npm test; node scripts/check-lwc.mjs. No business records accessed.
