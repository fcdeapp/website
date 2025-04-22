// src/app/video-production/[taskId]/page.tsx

import React from 'react';
import VideoProductionPage from '../../../components/VideoProductionPage';

export const dynamic = 'force-dynamic';

// 이거 꼭 추가!
export async function generateStaticParams() {
  return []; // 빈 배열 리턴해도 타입 문제 해결됨!
}

interface PageProps {
  params: { taskId: string };
}

const VideoProductionTaskPage = ({ params }: PageProps) => {
  const { taskId } = params;
  return <VideoProductionPage taskId={taskId} />;
};

export default VideoProductionTaskPage;
