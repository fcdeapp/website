"use client";
import { useEffect, useState } from "react";
import type { Question } from "../_lib/types";
import { loadQuestion } from "../_lib/data";
export function useQuestion(id: string) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    setQuestion(null);
    setError("");
    loadQuestion(id)
      .then((q) => {
        if (live) setQuestion(q);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [id, retry]);
  return {
    question: question?.id === id ? question : null,
    error,
    retry: () => setRetry((x) => x + 1),
  };
}
