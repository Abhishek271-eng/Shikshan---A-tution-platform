import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { ClayDialog } from '../components/common/ClayDialog';
import { ClayButton } from '../components/common/ClayButton';
import { LogOut } from 'lucide-react';
import { ShikshanLogo } from '../components/common/ShikshanLogo';

type BackHandler = () => boolean; // returns true if it handled the back action

interface NavigationContextType {
  registerBackHandler: (handler: BackHandler) => () => void;
  pushBackHandler: (handler: BackHandler) => () => void;
  triggerBack: () => void;
  isExitDialogOpen: boolean;
  setIsExitDialogOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handlersRef = useRef<BackHandler[]>([]);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const registerBackHandler = useCallback((handler: BackHandler) => {
    handlersRef.current.push(handler);
    return () => {
      handlersRef.current = handlersRef.current.filter((h) => h !== handler);
    };
  }, []);

  const triggerBack = useCallback(() => {
    // 1. If an exit dialog is currently showing, close it
    if (isExitDialogOpen) {
      setIsExitDialogOpen(false);
      return;
    }

    // 2. Check if any modal, drawer, or sheet registered a back handler
    if (handlersRef.current.length > 0) {
      const topHandler = handlersRef.current[handlersRef.current.length - 1];
      const handled = topHandler();
      if (handled) return;
    }

    // 3. Root path checks
    const rootPaths = ['/', '/login', '/student/dashboard', '/tutor/dashboard', '/tutor/status', '/admin'];
    const isRoot = rootPaths.includes(location.pathname);

    if (isRoot) {
      setIsExitDialogOpen(true);
      return;
    }

    // 4. Fallback to router navigate back
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  }, [isExitDialogOpen, location.pathname, navigate]);

  // Android hardware back button integration via Capacitor
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let isSubscribed = true;
    let removeListener: (() => void) | null = null;

    CapApp.addListener('backButton', () => {
      triggerBack();
    }).then((handler) => {
      if (isSubscribed) {
        removeListener = () => handler.remove();
      } else {
        handler.remove();
      }
    });

    return () => {
      isSubscribed = false;
      if (removeListener) removeListener();
    };
  }, [triggerBack]);

  const handleExitApp = () => {
    setIsExitDialogOpen(false);
    if (Capacitor.isNativePlatform()) {
      CapApp.exitApp();
    } else {
      // In web browser preview, close modal or minimize
      console.log('App exit requested (native only)');
    }
  };

  return (
    <NavigationContext.Provider
      value={{
        registerBackHandler,
        pushBackHandler: registerBackHandler,
        triggerBack,
        isExitDialogOpen,
        setIsExitDialogOpen,
      }}
    >
      {children}

      {/* Global Native App Exit Confirmation Dialog */}
      <ClayDialog
        isOpen={isExitDialogOpen}
        onClose={() => setIsExitDialogOpen(false)}
        title="Exit Shikshan?"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <ShikshanLogo size="lg" showText={false} />
          </div>

          <div className="space-y-1">
            <h3 className="font-black text-lg text-slate-800">Do you want to exit Shikshan?</h3>
            <p className="text-xs text-slate-500 font-medium">
              You will remain securely logged in when you return.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <ClayButton
              variant="secondary"
              fullWidth
              size="md"
              onClick={() => setIsExitDialogOpen(false)}
            >
              Stay in App
            </ClayButton>
            <ClayButton
              variant="danger"
              fullWidth
              size="md"
              onClick={handleExitApp}
              icon={<LogOut className="w-4 h-4" />}
            >
              Exit
            </ClayButton>
          </div>
        </div>
      </ClayDialog>
    </NavigationContext.Provider>
  );
};

const fallbackNavigationContext: NavigationContextType = {
  registerBackHandler: () => () => {},
  pushBackHandler: () => () => {},
  triggerBack: () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  },
  isExitDialogOpen: false,
  setIsExitDialogOpen: () => {},
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  return context || fallbackNavigationContext;
};
