"use client";
import { Toaster } from "react-hot-toast";
export function ToastProvider() {
  return (
    <div>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #319691",
            padding: "12px 16px",
          },
        }}
      />
    </div>
  );
}
