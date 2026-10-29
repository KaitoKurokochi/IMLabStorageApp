import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, QrCode, X, User as UserIcon, PlusCircle, List, LogIn, LogOut, Home, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePassphrase } from '../context/PassphraseContext';
import { getUserDisplayName } from '../api/client';
import { QRScannerModal } from './QRScannerModal';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { isAuthorized, revokeAuth, openModal } = usePassphrase();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Menu button [=] */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="メニューを開く"
            className="p-2 -ml-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Title */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-indigo-700 transition">
              杉
            </div>
            <span className="font-bold text-slate-800 text-base tracking-tight group-hover:text-indigo-600 transition">
              杉本研究室 備品管理
            </span>
          </Link>

          {/* QR Button [QR] */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            aria-label="QRコード読み込み"
            className="flex items-center gap-1 px-2.5 py-1.5 -mr-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-semibold border border-indigo-200 transition"
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            <span>QR</span>
          </button>
        </div>
      </header>

      {/* Slide-over Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-right">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">メニュー</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User status card in menu */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    {currentUser.first_name.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{getUserDisplayName(currentUser)}</p>
                    <span className="inline-block px-1.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded">
                      {currentUser.grade}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  <p>ログインしていません</p>
                  <p className="mt-0.5">備品を使用・記録するにはログインしてください</p>
                </div>
              )}
            </div>

            {/* Nav Links */}
            <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  location.pathname === '/'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>メイン画面</span>
              </Link>

              {currentUser ? (
                <Link
                  to={`/users/${currentUser.id}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    location.pathname.startsWith('/users/')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  <span>ユーザーページ</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    location.pathname === '/login'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <LogIn className="w-4 h-4 text-indigo-600" />
                  <span>ログイン</span>
                </Link>
              )}

              <Link
                to="/items"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  location.pathname === '/items'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <List className="w-4 h-4" />
                <span>全備品一覧</span>
              </Link>

              <Link
                to="/items/new"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  location.pathname === '/items/new'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>備品登録</span>
              </Link>
            </nav>

            {/* Passphrase Authorization Status */}
            <div className="p-3 border-t border-slate-100">
              <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-bold">研究室の合言葉</span>
                  {isAuthorized ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>認証済み</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>未認証</span>
                    </span>
                  )}
                </div>

                {isAuthorized ? (
                  <button
                    onClick={() => {
                      revokeAuth();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center text-[11px] text-slate-400 hover:text-rose-600 transition underline"
                  >
                    合言葉の認証を解除
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      openModal();
                    }}
                    className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition text-center shadow-sm"
                  >
                    合言葉を入力する
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-slate-100 space-y-1">
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ログアウト</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </>
  );
};

