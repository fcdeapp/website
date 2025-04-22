// src/app/video-production/[taskId]/page.tsx
import React from 'react';
import VideoProductionPage from '../../../components/VideoProductionPage';

// CSR 강제(dynamic routing)
export const dynamic = 'force-dynamic';

export default function VideoProductionTaskPage({
  params,
}: {
  params: { taskId: string };
}) {
  const taskId = params.taskId;
  return <VideoProductionPage taskId={taskId} />;
}
