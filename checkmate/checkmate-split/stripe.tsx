import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

export const STRIPE_PUBLISHABLE_KEY = 'YOUR_STRIPE_PUBLISHABLE_KEY';

export const Stripe = ({ children }: { children: React.ReactNode }) => (
  <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
    {children}
  </StripeProvider>
);

