"use client";
import { useEffect, useRef, useState } from "react";
export function useLoad<T>(loader: () => Promise<T>, key: string) {
  const fn = useRef(loader);
  fn.current = loader;
  const [state, setState] = useState<{ data?: T; error?: string; key: string }>(
    { key: "" },
  );
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ key });
    fn.current()
      .then((data) => {
        if (active) setState({ data, key });
      })
      .catch((e) => {
        if (active)
          setState({ key, error: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      active = false;
    };
  }, [key, revision]);
  return {
    data: state.key === key ? state.data : undefined,
    error: state.key === key ? state.error : undefined,
    retry: () => setRevision((x) => x + 1),
  };
}
