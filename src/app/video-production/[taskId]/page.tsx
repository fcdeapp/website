'use client';

import React from 'react';
import VideoProductionPage from '../../../components/VideoProductionPage';

const VideoProductionTaskPage = ({ params }: { params: { taskId: string } }) => {
  return <VideoProductionPage taskId={params.taskId} />;
};

export default VideoProductionTaskPage;
