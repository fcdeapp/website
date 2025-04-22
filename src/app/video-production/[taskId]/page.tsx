'use client';

import { Metadata } from 'next';
import React from 'react';
import VideoProductionPage from '../../../components/VideoProductionPage';

// Next.js PageProps 타입
interface PageProps {
  params: {
    taskId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const VideoProductionTaskPage = ({ params }: PageProps) => {
  const { taskId } = params;

  return <VideoProductionPage taskId={taskId} />;
};

export default VideoProductionTaskPage;

