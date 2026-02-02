// src/components/SearchBar.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const REGIONS = {
  '北海道・東北': ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  '関東': ['東京都', '神奈川県', '埼玉県', '千葉県', '茨城県', '栃木県', '群馬県'],
  '中部': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
  '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
  '九州・沖縄': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
}

export function SearchBar({ 
  currentKeyword = '', 
  currentPrefecture = '',
  searchPath = '/main/search'
}: { 
  currentKeyword?: string
  currentPrefecture?: string
  searchPath?: string
}) {
  const router = useRouter()
  const [keyword, setKeyword] = useState(currentKeyword)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedPrefecture, setSelectedPrefecture] = useState(currentPrefecture)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (selectedPrefecture) params.set('prefecture', selectedPrefecture)
    
    const queryString = params.toString()
    router.push(`${searchPath}${queryString ? `?${queryString}` : ''}`)
  }

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    setSelectedPrefecture('') // 地域変更時は都道府県をリセット
  }

  const handleReset = () => {
    setKeyword('')
    setSelectedRegion('')
    setSelectedPrefecture('')
    router.push(searchPath)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        検索・絞り込み
      </h3>
      
      <div className="space-y-4">
        {/* キーワード検索 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            キーワード
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="タイトルや内容で検索"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* 地域選択 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              地域
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">すべて</option>
              {Object.keys(REGIONS).map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              都道府県
            </label>
            <select
              value={selectedPrefecture}
              onChange={(e) => setSelectedPrefecture(e.target.value)}
              disabled={!selectedRegion}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">すべて</option>
              {selectedRegion && REGIONS[selectedRegion as keyof typeof REGIONS]?.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            検索
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  )
}