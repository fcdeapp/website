"use client";
import { createContext } from 'react';
import type { ReaderData } from '../_lib/reader';
export const ReaderContext = createContext<{data:ReaderData|null;enabled:boolean}>({data:null,enabled:true});
