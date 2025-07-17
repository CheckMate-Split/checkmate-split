import React, { createContext, useContext, useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
import { TEST_MODE } from './testMode';

interface Context {
  link: string | null;
  refresh: (test?: boolean) => Promise<string | null>;
}

const ConnectLinkContext = createContext<Context>({
  link: null,
  refresh: async () => null,
});

export const ConnectLinkProvider = ({ children }: { children: React.ReactNode }) => {
  const [link, setLink] = useState<string | null>(null);

  const refresh = async (test = TEST_MODE) => {
    try {
      const callable = httpsCallable(functions, 'createStripeConnectLink');
      const res: any = await callable({ test });
      const url = res?.data?.url || null;
      if (!test) {
        setLink(url);
      }
      return url;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  useEffect(() => {
    refresh(TEST_MODE);
  }, []);

  return (
    <ConnectLinkContext.Provider value={{ link, refresh }}>
      {children}
    </ConnectLinkContext.Provider>
  );
};

export const useConnectLink = () => useContext(ConnectLinkContext);
