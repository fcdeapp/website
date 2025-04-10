"use client";

import React, { Suspense } from "react";
import SearchPage from "../../components/Search";

const SearchPageWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SearchPage />
  </Suspense>
);

export default SearchPageWrapper;
