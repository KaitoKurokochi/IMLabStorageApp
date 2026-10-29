import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { usePassphrase } from '../context/PassphraseContext';

export const PassphraseModal: React.FC = () => {
  const { isModalOpen, closeModal, authorize, handleSuccess } = usePassphrase();
  const [passphrase, setPassphrase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      setPassphrase('');
      setErrorMessage(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) {
      setErrorMessage('合言葉を入力してください。');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await authorize(passphrase.trim());
      await handleSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || '合言葉が正しくありません。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={closeModal}
      />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <span>研究室の合言葉による認証</span>
          </div>
          <button
            onClick={closeModal}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            備品の登録・借用・返却・削除などの変更操作を行うには、研究室の合言葉（パスワード）が必要です。一度成功するとこのブラウザに長期間キャッシュされます。
          </p>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              合言葉 (パスワード)
            </label>
            <input
              ref={inputRef}
              type="password"
              autoComplete="current-password"
              required
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="合言葉を入力"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="w-1/3 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-semibold transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>確認中...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>認証する</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

