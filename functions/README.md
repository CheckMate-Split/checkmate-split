# Firebase Cloud Functions

Functions in this project are organized by feature inside their own directories.
Each folder exports its functions from an `index.js` file. The top-level
`functions/index.js` imports from these folders and re-exports them for
Firebase to deploy.

Current structure:

- `receiptScan/` &mdash; contains `scanReceipt` (callable, requires auth) for receipt OCR
- `stripeConnect/` &mdash; contains `createStripeConnectLink` for onboarding
- `username/` &mdash; contains `checkUsername` for validating unique usernames

Add new functionality by creating a folder with an `index.js` and exporting your
function in `functions/index.js`.

Stripe functions expect a secret key provided via `functions.config().stripe.secret`.
Set this with the Firebase CLI:

```sh
firebase functions:config:set stripe.secret="<YOUR_SECRET_KEY>"
```

Moov functions require API credentials via `functions.config().moov.public` and
`functions.config().moov.secret`. Set them with:

```sh
firebase functions:config:set \
  moov.public="<YOUR_MOOV_PUBLIC_KEY>" \
  moov.secret="<YOUR_MOOV_SECRET_KEY>"
```
