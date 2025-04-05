// src/app/startPage/page.tsx
"use client";

import React, { useState } from "react";
import StartPage from "../../components/StartPage"; // ← 이게 onFinish prop을 받는 컴포넌트

const StartPageWrapper = () => {
  const [done, setDone] = useState(false);

  if (done) {
    return null; // 또는 <Redirect to="..." /> 같은 처리
  }

  return <StartPage onFinish={() => setDone(true)} />;
};

export default StartPageWrapper;
