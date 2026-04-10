"use client";

import { useEffect } from "react";

export default function AnonymousSessionTracker() {
  useEffect(() => {
    void fetch("/api/visitor/session-active", {
      method: "POST",
      credentials: "same-origin",
    });
  }, []);

  return null;
}
