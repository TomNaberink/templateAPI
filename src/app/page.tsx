import ExamBuilder from '@/components/ExamBuilder'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-purple-800 mb-4">
              Toets Generator
            </h1>
            <p className="text-lg text-purple-600">
              Ontwikkel professionele kennistoetsen op maat
            </p>
          </header>

          <ExamBuilder />
        </div>
      </div>
    </div>
  )
}