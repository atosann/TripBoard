'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface FirstTimeModalProps {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export function FirstTimeModal({ open, onClose, onAgree }: FirstTimeModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            🚨 初めて参加される方へ
          </DialogTitle>
          <DialogDescription>
            Trip Boardは気軽な散策を楽しむためのサービスです。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">
              ✅ オフラインでの集合は自己責任です
            </h3>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>運営は実際の集合やトラブルに関与しません</li>
              <li>初対面の方と会う際は公共の場を選んでください</li>
              <li>貴重品の管理、安全確保は各自で行ってください</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">
              ❌ 以下の行為は禁止です
            </h3>
            <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
              <li>商業目的の勧誘（マルチ商法、ネットワークビジネス等）</li>
              <li>出会い目的での利用</li>
              <li>個人情報の無断公開</li>
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            違反を発見した場合は通報ボタンから報告してください。
          </p>

          <div className="flex items-start space-x-2 pt-4">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="agree"
              className="text-sm font-medium leading-relaxed cursor-pointer"
            >
              上記内容を理解し、同意します。また、
              <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                利用規約
              </a>
              および
              <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                プライバシーポリシー
              </a>
              に同意します。
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button 
            onClick={() => {
              if (agreed) {
                onAgree();
              }
            }} 
            disabled={!agreed}
            className="bg-blue-600 hover:bg-blue-700"
          >
            同意して参加する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}