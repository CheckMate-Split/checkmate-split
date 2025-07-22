# Checkmate Split

This example React Native project demonstrates integrating Firebase, Stripe and a receipt scanning cloud function. The project uses Expo and TypeScript. A simple navigation flow lets you scan a receipt and confirm the parsed result.

## Running the app

1. Install dependencies in the mobile app directory:
   ```sh
   cd checkmate/checkmate-split
   yarn install
   ```
2. Start the Expo development server:
   ```sh
   yarn start
   ```


## Firebase Cloud Functions

Firebase functions live in the `functions` folder. Each feature has its own
subdirectory with an `index.js` that exports its functions. See
`functions/README.md` for details on the layout. The `scanReceipt` function
proxies requests to the TagGun API to parse receipt images.
Deploy with the Firebase CLI after configuring credentials:

```sh
cd functions
npm install
firebase deploy --only functions
```

## Configuration

Edit `checkmate/checkmate-split/firebaseConfig.ts` with your Firebase project settings and supply a Stripe publishable key in `checkmate/checkmate-split/stripe.ts`.
You will also need a TagGun API key configured as `functions.config().taggun.key` when deploying the cloud function.
The Stripe secret key should be set using the Firebase CLI:

```sh
firebase functions:config:set stripe.secret="<YOUR_SECRET_KEY>"
```
Optionally configure onboarding URLs with `stripe.return_url` and `stripe.refresh_url`.

The mobile app initializes Firebase Auth using AsyncStorage persistence so users
remain signed in across sessions.

## Pay Web

A minimal static page for web payments lives in `pay-web/public/index.html`. Pass a `receipt_id` query parameter to link a specific receipt. Optionally include `name` to show who invited you. The page offers a button to pay on the web and links to download the Checkmate app from the App Store or Google Play.
