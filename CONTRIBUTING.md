# Development and testing workflow

- main contains the accepted baseline.
- testing contains subsequent implementation changes for Dev Org testing.
- Commit new changes to testing. Run npm ci, npm test and node scripts/check-lwc.mjs.
- Deploy testing to the Dev Org and record UAT outcomes in TRACKER.md and QA.md.
- Open a pull request from testing to main after automated checks and relevant UAT pass.
- Merge after review/testing acceptance. Do not force-push either branch.

CI validates the model and local LWC compilation; it does not deploy to Salesforce or prove browser behaviour. No org credentials are committed.
