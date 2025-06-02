import TestChatBot from '@/components/TestChatBot'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 rounded-full mb-6">
            <span className="text-3xl">🐕</span>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Honden Chatbot
          </h1>
          
          <p className="text-xl text-amber-700 font-medium">
            Je persoonlijke assistent voor al je honden vragen!
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <TestChatBot />
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-4 text-amber-600">
              <span>🐾</span>
              <span>Stel je vragen over honden!</span>
              <span>🐾</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}