import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

export const STRIPE_PUBLISHABLE_KEY =
  'pk_test_51RkocfRMOfhikXrqB7QCCbNSfVeCeBqWlNS0x61dhOXtdPBXw2paO2kSjpgJG8qCQ3rdvSdFogM8YPQMVLq4HkYc00gGgwVqzj';

export const Stripe = ({ children }: { children: React.ReactElement | React.ReactElement[] }) => (
  <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
    {children}
  </StripeProvider>
);

