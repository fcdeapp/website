// src/app/video-production/[taskId]/page.tsx
import React from 'react';
import VideoProductionPage from '../../../components/VideoProductionPage';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { taskId: string };
}

const VideoProductionTaskPage = ({ params }: PageProps) => {
  const { taskId } = params;
  return <VideoProductionPage taskId={taskId} />;
};

export default VideoProductionTaskPage;
