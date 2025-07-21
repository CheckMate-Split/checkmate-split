import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
import { TEST_MODE } from './testMode';

interface Context {
  walletId: string | null;
  refresh: () => Promise<string | null>;
}

const ConnectLinkContext = createContext<Context>({
  walletId: null,
  refresh: async () => null,
});

export const ConnectLinkProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletId, setWalletId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const callable = httpsCallable(functions, 'createMoovWallet');
      const res: any = await callable();
      const id = res?.data?.walletId || null;
      setWalletId(id);
      return id;
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e?.message || 'failed to create wallet');
      return null;
    }
  };


  return (
    <ConnectLinkContext.Provider value={{ walletId, refresh }}>
      {children}
    </ConnectLinkContext.Provider>
  );
};

export const useConnectLink = () => useContext(ConnectLinkContext);
