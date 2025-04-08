"use client";

import dynamic from 'next/dynamic';

const FullpostNoSSR = dynamic(() => import('../../components/Fullpost'), { ssr: false });
export default FullpostNoSSR;
