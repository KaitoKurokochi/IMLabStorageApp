import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('名前を入力してください。');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const user = await login(firstName.trim(), lastName.trim());
      navigate(`/users/${user.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'ログインに失敗しました。名前を確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6 pt-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">ログイン</h1>
          <p className="text-xs text-slate-500">
            登録済みの名前を英語表記で入力してください
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                名 (First name)
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="例: Taro"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                姓 (Last name)
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="例: Yamada"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>ログイン中...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>ログイン</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-3 text-center border-t border-slate-100">
            <Link
              to="/users/new"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>新規登録はこちら</span>
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
};

