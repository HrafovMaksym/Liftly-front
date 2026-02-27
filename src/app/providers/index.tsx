import { ReactNode } from "react";

import { ReduxProvider } from "./redux-provider";
import { ToastProvider } from "./toast-provider";

export const MainProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ReduxProvider>{children}</ReduxProvider>
      <ToastProvider></ToastProvider>
    </>
  );
};
