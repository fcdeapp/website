// src/app/video-production/[taskId]/page.tsx
import { Metadata } from 'next';
import React from 'react';
import VideoProductionPage from '../../../components/VideoProductionPage';

type Params = {
  taskId: string;
};

export const dynamic = 'force-dynamic';

export const generateStaticParams = async () => {
  return []; // Next.js가 dynamic으로 처리
};

interface PageProps {
  params: { taskId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

const VideoProductionTaskPage = ({ params }: PageProps) => {
  const { taskId } = params;
  return <VideoProductionPage taskId={taskId} />;
};

export default VideoProductionTaskPage;
