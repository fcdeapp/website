'use client';

// src/app/video-production/[taskId]/page.tsx
import { Metadata } from 'next';
import React from 'react';
import VideoProductionPage from '../../../components/VideoProductionPage';

interface PageProps {
  params: {
    taskId: string;
  };
}

export const dynamic = 'force-dynamic'; // 추가로 dynamic routing 설정

const VideoProductionTaskPage = ({ params }: PageProps) => {
  const { taskId } = params;

  return <VideoProductionPage taskId={taskId} />;
};

export default VideoProductionTaskPage;
