# Checkmate Split

This example React Native project demonstrates integrating Firebase, Stripe and a receipt scanning cloud function. The project uses Expo and TypeScript.

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

Firebase functions live in the `functions` folder. The `scanReceipt` function proxies requests to the TagGun API to parse receipt images.
Deploy with the Firebase CLI after configuring credentials:

```sh
cd functions
npm install
firebase deploy --only functions
```

## Configuration

Edit `checkmate/checkmate-split/firebaseConfig.ts` with your Firebase project settings and supply a Stripe publishable key in `checkmate/checkmate-split/stripe.ts`.
