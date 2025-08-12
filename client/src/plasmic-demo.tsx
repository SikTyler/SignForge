import React from 'react';

// Try to import a generated Plasmic page if it exists
let PlasmicDemoPage: React.ComponentType | null = null;

try {
  // This will only work if Plasmic components have been generated
  const { PlasmicHomepage } = await import('./plasmic/PlasmicHomepage');
  PlasmicDemoPage = PlasmicHomepage;
} catch (error) {
  // Plasmic components not yet generated
  console.log('Plasmic components not found - run npm run plasmic:sync first');
}

export default function PlasmicDemo() {
  if (!PlasmicDemoPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Plasmic Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No Plasmic components found yet.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Run <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">npm run plasmic:sync</code> to generate components.
          </p>
        </div>
      </div>
    );
  }

  return <PlasmicDemoPage />;
}
