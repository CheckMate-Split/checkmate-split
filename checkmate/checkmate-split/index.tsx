import { registerRootComponent } from 'expo';
import React from 'react';
import App from './App';
import { Stripe } from './stripe';
import { ConnectLinkProvider } from './connectLink';

function Root() {
  return (
    <Stripe>
      <ConnectLinkProvider>
        <App />
      </ConnectLinkProvider>
    </Stripe>
  );
}

registerRootComponent(Root);
