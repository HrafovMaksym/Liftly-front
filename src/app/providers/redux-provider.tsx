"use client";
import { Provider } from "react-redux";
import { ReactNode, useRef } from "react";
import { makeStore, AppStore } from "@/shared/config/store/store";

export const ReduxProvider = ({
  // initialUser,
  children,
}: {
  // initialUser?: User;
  children: ReactNode;
}) => {
  // const storeRef = useRef<AppStore | null>(null);
  // if (!storeRef.current) {
  //   storeRef.current = makeStore();

  //   if (initialUser) {
  //     storeRef.current.dispatch(setUser(initialUser));
  //   }
  // }
  return <Provider store={makeStore()}>{children}</Provider>;
};
