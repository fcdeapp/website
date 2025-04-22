'use client';

// src/app/video-production/[taskId]/page.tsx
import { Metadata } from 'next';
import React from 'react';
import VideoProductionPage from '../../../components/VideoProductionPage';

type Params = {
  taskId: string;
};

interface PageProps {
  params: Params; // 명확하게 정의
  searchParams?: { [key: string]: string | string[] | undefined };
}

export const dynamic = 'force-dynamic'; // 동적 설정

const VideoProductionTaskPage = (props: PageProps) => {
  const { taskId } = props.params;
  return <VideoProductionPage taskId={taskId} />;
};

export default VideoProductionTaskPage;
