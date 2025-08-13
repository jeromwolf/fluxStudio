import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Flux Studio</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/studio"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Launch Studio
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mb-6 text-5xl font-bold text-white md:text-6xl">
            Create Stunning Animations
            <span className="mt-2 block text-blue-500">with Synchronized Audio</span>
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-300">
            Professional web-based animation studio for creating geometric network animations with
            real-time audio synthesis and effects.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/studio"
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-blue-700"
            >
              Start Creating
            </Link>
            <button className="rounded-lg bg-gray-700 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-gray-600">
              View Examples
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div className="mb-4 h-12 w-12 rounded-lg bg-blue-600"></div>
            <h3 className="mb-2 text-xl font-semibold text-white">Real-time Canvas</h3>
            <p className="text-gray-400">
              60fps rendering with WebGL acceleration for smooth animations
            </p>
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div className="mb-4 h-12 w-12 rounded-lg bg-purple-600"></div>
            <h3 className="mb-2 text-xl font-semibold text-white">Audio Synthesis</h3>
            <p className="text-gray-400">
              Create and sync sound effects with your animations in real-time
            </p>
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div className="mb-4 h-12 w-12 rounded-lg bg-green-600"></div>
            <h3 className="mb-2 text-xl font-semibold text-white">Multi-format Export</h3>
            <p className="text-gray-400">Export to GIF, MP4, WebM, SVG, Lottie, and more formats</p>
          </div>
        </div>

        {/* Export Formats */}
        <div className="mt-24">
          <h3 className="mb-12 text-center text-3xl font-bold text-white">Export to Any Format</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {['PNG', 'GIF', 'MP4', 'WebM', 'SVG', 'Lottie'].map((format) => (
              <div
                key={format}
                className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-center"
              >
                <span className="font-medium text-white">{format}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
