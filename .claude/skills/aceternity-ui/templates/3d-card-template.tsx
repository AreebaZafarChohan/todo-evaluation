// Template: 3D Card Component
// Usage: Copy and customize for your 3D card needs

'use client';

import { Card3D, Card3DBody } from '@/components/ui/3d-card';

export function Card3DTemplate() {
  return (
    <Card3D
      containerClassName="w-full max-w-sm mx-auto"
      className="bg-neutral-900 rounded-xl p-8 shadow-2xl"
    >
      <Card3DBody className="space-y-4">
        {/* Your content here */}
        <h3 className="text-2xl font-bold text-white">Card Title</h3>
        <p className="text-neutral-300">
          This card has 3D hover effects. Move your mouse over it to see the effect.
        </p>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          Learn More
        </button>
      </Card3DBody>
    </Card3D>
  );
}
