export default function StudioPage() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4">
          <h1 className="text-xl font-bold text-white">Flux Studio</h1>
        </div>
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            <button className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              Projects
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              Templates
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-md">
              Export History
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center px-4">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              New Animation
            </button>
            <button className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">
              Import
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex">
          {/* Animation Canvas */}
          <div className="flex-1 bg-gray-950 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <p className="text-lg mb-2">Animation Canvas</p>
              <p className="text-sm">Click "New Animation" to start creating</p>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
            <h2 className="text-white font-semibold mb-4">Properties</h2>
            <div className="text-gray-400 text-sm">
              <p>No element selected</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="h-48 bg-gray-800 border-t border-gray-700 p-4">
          <h2 className="text-white font-semibold mb-2">Timeline</h2>
          <div className="bg-gray-900 rounded h-32 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Timeline will appear here</p>
          </div>
        </div>
      </main>
    </div>
  );
}