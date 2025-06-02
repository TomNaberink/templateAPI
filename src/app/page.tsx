import CabaretChatBot from '@/components/CabaretChatBot'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <CabaretChatBot />
        </div>
      </div>
    </div>
  )
}