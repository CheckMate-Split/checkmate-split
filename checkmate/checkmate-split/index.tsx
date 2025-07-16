import { registerRootComponent } from 'expo';
import React from 'react';
import App from './App';
import { Stripe } from './stripe';

function Root() {
  return (
    <Stripe>
      <App />
    </Stripe>
  );
}

registerRootComponent(Root);
