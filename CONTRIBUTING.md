# Contributing

Thanks for contributing to **clinicaltrials-on-blockchain**.

This is a legacy Truffle + Solidity + browser JavaScript demo. Please keep changes small, focused, and easy to review.

## Quick start (local dev)

1. Install dependencies:

```bash
npm install
npm install -g truffle ethereumjs-testrpc
```

2. Start blockchain node (terminal 1):

```bash
testrpc
```

3. Initialize IPFS (one-time setup on a fresh machine):

```bash
ipfs init
```

4. Start IPFS daemon (terminal 2):

```bash
ipfs daemon
```

5. Deploy contracts (terminal 3):

```bash
truffle migrate
```

6. Serve app:

```bash
truffle serve -p 8081
```

Open: `http://localhost:8081`.

---

## Read the code in this order

If you're new, read these files in sequence:

1. `README.md` — project purpose and manual setup flow.
2. `truffle.js` — build bundling and local network config.
3. `migrations/1_initial_migration.js`, `migrations/2_deploy_contracts.js` — deployment order.
4. `contracts/Regulator.sol` — main workflow (CRO onboarding, proposals, acceptance).
5. `contracts/ClinicalTrial.sol` — subjects + trial datapoints per accepted proposal.
6. `app/index.html` — UI tabs and DOM ids.
7. `app/javascripts/app.js` — event wiring, web3 calls, and IPFS upload flow.

---

## Suggested first contributions

Good first PRs:

- Fix obvious typos and naming inconsistencies.
- Fix UI selector or event-binding mistakes.
- Remove dead variables / unreachable code.
- Add comments where contract behavior is non-obvious.
- Improve README and developer docs.

Please avoid large rewrites in one PR.

---

## Coding guidelines

### Solidity (legacy)

- Contracts currently use `pragma solidity ^0.4.4`; keep compatibility unless your PR is explicitly a migration.
- Preserve event emissions when refactoring behavior.
- Be careful with storage vs memory semantics.

### Frontend JavaScript

- Keep DOM ids, selectors, and click handlers in sync with `app/index.html`.
- Prefer small, isolated edits over broad refactors.
- Keep user-facing messages clear and actionable.

---

## How to validate your change

At minimum:

1. `truffle migrate` completes without errors.
2. App serves via `truffle serve -p 8081`.
3. Manually smoke-test the flow you touched in the browser.

If your change touches contracts, include exact reproduction steps in your PR description.

---

## Pull request checklist

Before opening a PR:

- [ ] Scope is focused (single concern).
- [ ] Commit message clearly states what changed and why.
- [ ] Any setup or behavior change is documented.
- [ ] Manual test steps are included.
- [ ] Screenshots are included for visible UI changes.

PR description should include:

- **What changed**
- **Why**
- **How to test**
- **Risks / follow-ups**

---

## Notes about this repository

- This is a demo-style app with some hardcoded sample flows (e.g., index-based reads).
- Tooling and dependencies are old; modernization is welcome, but please do it incrementally.

Thanks again for contributing.
