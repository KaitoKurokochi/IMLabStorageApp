import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, getStoredAuthToken, removeStoredAuthToken } from '../api/client';

interface PassphraseContextType {
  isAuthorized: boolean;
  isLoadingAuth: boolean;
  isModalOpen: boolean;
  authorize: (passphrase: string) => Promise<void>;
  revokeAuth: () => void;
  openModal: (onSuccess?: () => void | Promise<void>) => void;
  closeModal: () => void;
  handleSuccess: () => Promise<void>;
  requireAuthorization: (action?: () => void | Promise<void>) => Promise<boolean>;
}

const PassphraseContext = createContext<PassphraseContextType | undefined>(undefined);

export const PassphraseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // モーダル認証成功時に実行するコールバック
  const pendingCallbackRef = useRef<(() => void | Promise<void>) | null>(null);
  const pendingPromiseResolverRef = useRef<((value: boolean) => void) | null>(null);

  // 初期ロード時にローカルストレージのトークンの有効性を確認
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredAuthToken();
      if (!storedToken) {
        setIsAuthorized(false);
        setIsLoadingAuth(false);
        return;
      }

      // トークンが存在する場合、念のためサーバーに有効性を問い合わせ
      try {
        const isValid = await api.checkAuthStatus();
        setIsAuthorized(isValid);
      } catch (e) {
        // オフラインまたは通信一時エラー時はローカルストレージの存在を信じて許可
        setIsAuthorized(true);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initAuth();
  }, []);

  const authorize = useCallback(async (passphrase: string) => {
    await api.verifyPassphrase(passphrase);
    setIsAuthorized(true);
  }, []);

  const revokeAuth = useCallback(() => {
    removeStoredAuthToken();
    setIsAuthorized(false);
  }, []);

  const openModal = useCallback((onSuccess?: () => void | Promise<void>) => {
    pendingCallbackRef.current = onSuccess || null;
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    if (pendingPromiseResolverRef.current) {
      pendingPromiseResolverRef.current(false);
      pendingPromiseResolverRef.current = null;
    }
    pendingCallbackRef.current = null;
  }, []);

  const requireAuthorization = useCallback(
    async (action?: () => void | Promise<void>): Promise<boolean> => {
      if (isAuthorized) {
        if (action) {
          await action();
        }
        return true;
      }

      return new Promise<boolean>((resolve) => {
        pendingPromiseResolverRef.current = resolve;
        pendingCallbackRef.current = action || null;
        setIsModalOpen(true);
      });
    },
    [isAuthorized]
  );

  const handleSuccess = useCallback(async () => {
    setIsModalOpen(false);
    const callback = pendingCallbackRef.current;
    const resolver = pendingPromiseResolverRef.current;
    pendingCallbackRef.current = null;
    pendingPromiseResolverRef.current = null;

    if (callback) {
      try {
        await callback();
      } catch (e) {
        console.error('Error executing pending action after authorization', e);
      }
    }

    if (resolver) {
      resolver(true);
    }
  }, []);

  return (
    <PassphraseContext.Provider
      value={{
        isAuthorized,
        isLoadingAuth,
        isModalOpen,
        authorize,
        revokeAuth,
        openModal,
        closeModal,
        requireAuthorization,
        handleSuccess,
      }}
    >
      {children}
    </PassphraseContext.Provider>
  );
};

export const usePassphrase = () => {
  const context = useContext(PassphraseContext);
  if (!context) {
    throw new Error('usePassphrase must be used within a PassphraseProvider');
  }
  return context;
};
