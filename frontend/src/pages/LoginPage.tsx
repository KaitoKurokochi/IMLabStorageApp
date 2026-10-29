import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { GRADES, UserSuggestion, api, getUserDisplayName } from '../api/client';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [grade, setGrade] = useState<string | null>(null);
  const [users, setUsers] = useState<UserSuggestion[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSuggestion | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 学年を選んだら、その学年のユーザーをサジェストに読み込む
  useEffect(() => {
    setSelectedUser(null);
    setUsers([]);
    if (!grade) return;

    let cancelled = false;
    setIsLoadingUsers(true);
    api.getUsersByGrade(grade)
      .then((list) => {
        if (!cancelled) setUsers(list);
      })
      .catch((err: any) => {
        if (!cancelled) setErrorMessage(err.message || 'ユーザー一覧の取得に失敗しました。');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingUsers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [grade]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setErrorMessage('学年と名前を選択してください。');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const user = await login(selectedUser.first_name, selectedUser.last_name);
      navigate(`/users/${user.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'ログインに失敗しました。');
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
            学年を選んでから、登録済みの名前を選択してください
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
              学年 / 身分
            </label>
            <Select
              options={GRADES.map((g) => ({ value: g, label: g }))}
              value={grade ? { value: grade, label: grade } : null}
              onChange={(option) => setGrade(option ? option.value : null)}
              placeholder="学年を選択"
              isSearchable={false}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              名前 (名 姓)
            </label>
            <Select
              options={users}
              value={selectedUser}
              onChange={(option) => setSelectedUser(option)}
              getOptionValue={(u) => u.id}
              getOptionLabel={getUserDisplayName}
              isDisabled={!grade}
              isLoading={isLoadingUsers}
              placeholder={grade ? '名前を選択 (入力で絞り込み)' : '先に学年を選択してください'}
              noOptionsMessage={() => 'この学年の登録ユーザーがいません'}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedUser}
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
