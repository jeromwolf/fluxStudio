export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-4 text-4xl font-bold text-blue-600">Tailwind CSS v4 Test</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold text-gray-800">Card 1</h2>
          <p className="text-gray-600">Testing basic utilities</p>
          <button className="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
            Click me
          </button>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <h2 className="mb-2 text-xl font-semibold">Card 2</h2>
          <p>Testing gradients</p>
        </div>

        <div className="rounded-lg border-2 border-gray-600 bg-gray-800 p-6 text-white">
          <h2 className="mb-2 text-xl font-semibold">Card 3</h2>
          <p className="text-gray-300">Testing dark theme colors</p>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <div className="h-16 w-16 rounded-full bg-red-500"></div>
        <div className="h-16 w-16 rounded bg-green-500"></div>
        <div className="h-16 w-16 rounded-lg bg-blue-500"></div>
      </div>
    </div>
  );
}
