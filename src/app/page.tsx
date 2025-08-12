import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Flux Studio</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/studio"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Launch Studio
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Create Stunning Animations
            <span className="block text-blue-500 mt-2">with Synchronized Audio</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Professional web-based animation studio for creating geometric network animations
            with real-time audio synthesis and effects.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/studio"
              className="px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Creating
            </Link>
            <button className="px-8 py-4 text-lg font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
              View Examples
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Real-time Canvas</h3>
            <p className="text-gray-400">
              60fps rendering with WebGL acceleration for smooth animations
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-600 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Audio Synthesis</h3>
            <p className="text-gray-400">
              Create and sync sound effects with your animations in real-time
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-green-600 rounded-lg mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Multi-format Export</h3>
            <p className="text-gray-400">
              Export to GIF, MP4, WebM, SVG, Lottie, and more formats
            </p>
          </div>
        </div>

        {/* Export Formats */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Export to Any Format
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {["PNG", "GIF", "MP4", "WebM", "SVG", "Lottie"].map((format) => (
              <div
                key={format}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center"
              >
                <span className="text-white font-medium">{format}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}