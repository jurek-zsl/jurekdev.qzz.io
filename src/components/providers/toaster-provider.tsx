"use client";

import { Toaster as SonnerToaster } from "sonner";

export function ToasterProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="dark"
      toastOptions={{
        style: {
          background: "#000000",
          border: "1px solid #e5e5e5",
          color: "#e5e5e5",
          borderRadius: "0px",
          boxShadow: "none",
          fontFamily: "monospace",
          fontSize: "12px",
        },
      }}
    />
  );
}
