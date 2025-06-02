'use client'

import { useState } from 'react'
import TestChatBot from '@/components/TestChatBot'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Chat met Arnoud
            </h1>
            <p className="text-gray-600">
              Je afstudeerbegeleider die altijd in is voor een grapje!
            </p>
          </div>
          
          <TestChatBot />
        </div>
      </div>
    </div>
  )
}