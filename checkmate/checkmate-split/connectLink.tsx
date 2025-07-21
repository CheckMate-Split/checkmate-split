import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
import { TEST_MODE } from './testMode';

interface Context {
  walletId: string | null;
  refresh: (info?: any) => Promise<string | null>;
}

const ConnectLinkContext = createContext<Context>({
  walletId: null,
  refresh: async () => null,
});

export const ConnectLinkProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletId, setWalletId] = useState<string | null>(null);

  const refresh = async (info?: any) => {
    try {
      const callable = httpsCallable(functions, 'createMoovWallet');
      const res: any = await callable(info);
      if (res?.data?.walletPending) {
        Alert.alert('Info', 'Verifying wallet...');
        let id: string | null = null;
        for (let i = 0; i < 12 && !id; i++) {
          await new Promise(r => setTimeout(r, 5000));
          const check: any = await httpsCallable(functions, 'checkWalletStatus')();
          id = check?.data?.walletId || null;
        }
        if (id) {
          Alert.alert('Success', 'Wallet created');
          setWalletId(id);
          return id;
        }
        Alert.alert('Info', 'Wallet pending verification.');
        return null;
      }
      const id = res?.data?.walletId || null;
      if (id) Alert.alert('Success', 'Wallet created');
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
