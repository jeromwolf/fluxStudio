'use client';

import { useState } from 'react';
import Link from 'next/link';
import { animationTemplates, type AnimationTemplate } from '@/lib/templates/animation-templates';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates', emoji: '🎯' },
    { id: 'social', name: 'Social Media', emoji: '📱' },
    { id: 'presentation', name: 'Presentations', emoji: '📊' },
    { id: 'web', name: 'Web Design', emoji: '🌐' },
    { id: 'nft', name: 'NFT & Web3', emoji: '💎' },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? animationTemplates 
    : animationTemplates.filter(template => template.category === selectedCategory);

  const freeTemplates = filteredTemplates.filter(t => !t.isPremium);
  const premiumTemplates = filteredTemplates.filter(t => t.isPremium);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Flux Studio
            </h1>
            <span className="text-sm text-gray-400">Choose your template</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm bg-gray-800 rounded-lg hover:bg-gray-700 transition-all">
              Sign In
            </button>
            <button className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
              Go Pro
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Flux Studio
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Create stunning animated visuals with real-time particle effects. 
            Choose from templates and customize with 3D tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/metaverse"
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 inline-block text-center"
            >
              🌐 Enter Metaverse
            </Link>
            <Link
              href="/world-builder"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 inline-block text-center"
            >
              🏗️ World Builder
            </Link>
            <Link
              href="/avatar-editor"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 inline-block text-center"
            >
              👤 Avatar Editor
            </Link>
            <Link
              href="/studio"
              className="px-8 py-4 bg-gray-800 rounded-lg font-semibold text-lg hover:bg-gray-700 transition-all inline-block text-center"
            >
              2D Studio
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            No credit card required • Free templates available
          </p>
        </div>
      </div>

      {/* Template Selection */}
      <div id="templates" className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Template
          </h2>
          <p className="text-xl text-gray-400">
            Each template comes with unique 3D visualization tools
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.emoji} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Free Templates Section */}
        {freeTemplates.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-green-500">🆓</span>
              Free Templates
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {freeTemplates.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Premium Templates Section */}
        {premiumTemplates.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-purple-500">💎</span>
                Premium Templates
              </h2>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
                Unlock All Premium
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {premiumTemplates.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Template Card Component
function TemplateCard({ template }: { template: AnimationTemplate }) {
  return (
    <Link 
      href={`/studio?template=${template.id}`}
      className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all cursor-pointer transform hover:scale-105 block"
    >
      {/* Premium Badge */}
      {template.isPremium && (
        <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-xs px-2 py-1 rounded-full font-medium">
          PRO
        </div>
      )}

      {/* Template Preview */}
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <span className="text-4xl">{template.thumbnail}</span>
      </div>

      {/* Template Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
          {template.name}
        </h3>
        <p className="text-xs text-gray-400 mb-2">{template.description}</p>
        
        {/* Template Settings Preview */}
        <div className="flex flex-wrap gap-1 text-xs">
          <span className="bg-gray-800 px-2 py-1 rounded">{template.config.nodeCount} nodes</span>
          <span className="bg-gray-800 px-2 py-1 rounded">{template.config.animationSpeed}x speed</span>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="px-4 py-2 bg-white text-black rounded-lg font-medium transform translate-y-2 group-hover:translate-y-0 transition-transform">
          Use Template
        </div>
      </div>
    </Link>
  );
}