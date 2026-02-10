// src/components/BackButton.tsx
'use client'

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
    >
      ← 戻る
    </button>
  )
}