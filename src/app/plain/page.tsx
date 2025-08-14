import React from 'react';
import ResumeUI from '../../3d/ResumeUI';

export default function PlainPage() {
  return (
    <main className="min-h-screen bg-gray-200 p-4">
      <ResumeUI />
      <a href="/" className="block mt-4 text-blue-600 underline text-xs">
        Back to 3D
      </a>
    </main>
  );
}

