import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Loader2, User } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { api, User as UserType } from '../api/client';

const GRADES = [
  'B1', 'B2', 'B3', 'B4',
  'M1', 'M2',
  'D1', 'D2', 'D3',
  '教員', '研究員', 'OB/OG', 'その他'
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('M1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserType[]>([]);

  useEffect(() => {
    api.getUsers().then(setRegisteredUsers).catch(console.error);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('名前を入力してください。');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const user = await login(name.trim(), grade);
      navigate(`/users/${user.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'ログインに失敗しました。名前と学年を確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectExistingUser = (u: UserType) => {
    setName(u.name);
    setGrade(u.grade);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6 pt-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">ログイン</h1>
          <p className="text-xs text-slate-500">
            登録済みの名前と学年を入力してください
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              名前
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 山田 太郎"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              学年
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
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

        {/* Existing Users Quick Tap (Helpful for quick lab use) */}
        {registeredUsers.length > 0 && (
          <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-2.5">登録済みユーザーから素早く選択:</p>
            <div className="flex flex-wrap gap-1.5">
              {registeredUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => selectExistingUser(u)}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-xs font-medium text-slate-700 transition flex items-center gap-1"
                >
                  <User className="w-3 h-3 text-indigo-500" />
                  <span>{u.name}</span>
                  <span className="text-[10px] text-slate-400">({u.grade})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

