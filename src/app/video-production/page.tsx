import React, { Suspense } from 'react';
import VideoProductionPage from '../../components/VideoProductionPage';

export default function VideoProductionPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideoProductionPage />
    </Suspense>
  );
}
