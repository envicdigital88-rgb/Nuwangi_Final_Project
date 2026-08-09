'use client';

import { Suspense, lazy, useState } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export function SplineScene({ scene, className }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div style={{ 
          textAlign: 'center', 
          color: '#ffffff',
          padding: '20px'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '10px' }}>👗</div>
          <div>3D Scene Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader"></span>
        </div>
      }
    >
      <Spline 
        scene={scene} 
        className={className}
        onError={() => setHasError(true)}
      />
    </Suspense>
  );
}
