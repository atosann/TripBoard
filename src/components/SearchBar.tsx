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
    // 都道府県が選択されている場合は専用ページに遷移
    if (selectedPrefecture) {
      router.push(`/main/prefecture/${encodeURIComponent(selectedPrefecture)}`)
      return
    }
    
    // キーワードのみの場合は検索ページに遷移
    if (keyword.trim()) {
      const params = new URLSearchParams()
      params.set('keyword', keyword.trim())
      router.push(`${searchPath}?${params.toString()}`)
      return
    }
    
    // 何も選択されていない場合は検索ページに戻る
    router.push(searchPath)
  }

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    setSelectedPrefecture('') // 地域変更時は都道府県をリセット
  }

  const handlePrefectureChange = (prefecture: string) => {
    setSelectedPrefecture(prefecture)
    // 都道府県を選択したら即座に専用ページに遷移
    if (prefecture) {
      router.push(`/main/prefecture/${encodeURIComponent(prefecture)}`)
    }
  }

  const handleReset = () => {
    setKeyword('')
    setSelectedRegion('')
    setSelectedPrefecture('')
    router.push(searchPath)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-emerald-200">
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
            >
              <option value="" disabled hidden>地域を選択</option>
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
              onChange={(e) => handlePrefectureChange(e.target.value)}
              disabled={!selectedRegion}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
            >
              <option value="" disabled hidden>都道府県を選択</option>
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
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
          >
            検索
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            リセット
          </button>
        </div>

        {/* 選択中の条件表示 */}
        {(keyword || selectedPrefecture) && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">検索条件:</p>
            <div className="flex flex-wrap gap-2">
              {keyword && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                  キーワード: {keyword}
                  <button
                    onClick={() => setKeyword('')}
                    className="hover:text-emerald-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedPrefecture && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                  {selectedPrefecture}
                  <button
                    onClick={() => {
                      setSelectedPrefecture('')
                      setSelectedRegion('')
                    }}
                    className="hover:text-emerald-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}