import React, { createContext, useContext, useState } from 'react';

interface UserMenuContextType {
  mobileSheetOpen: boolean;
  setMobileSheetOpen: (open: boolean) => void;
  desktopMenuOpen: boolean;
  setDesktopMenuOpen: (open: boolean) => void;
}

const UserMenuContext = createContext<UserMenuContextType | undefined>(undefined);

export const UserMenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

  return (
    <UserMenuContext.Provider
      value={{
        mobileSheetOpen,
        setMobileSheetOpen,
        desktopMenuOpen,
        setDesktopMenuOpen,
      }}
    >
      {children}
    </UserMenuContext.Provider>
  );
};

export const useUserMenu = () => {
  const context = useContext(UserMenuContext);
  if (!context) {
    throw new Error('useUserMenu must be used within a UserMenuProvider');
  }
  return context;
};

