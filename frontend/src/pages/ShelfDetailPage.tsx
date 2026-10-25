import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, QrCode, PlusCircle, Package } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Layout } from '../components/Layout';
import { ShelfGrid } from '../components/ShelfGrid';
import { ItemCard } from '../components/ItemCard';
import { api, Shelf, Item } from '../api/client';

export const ShelfDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [shelf, setShelf] = useState<Shelf | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (shelfId: string) => {
    try {
      setLoading(true);
      const [shelvesData, shelfDetail] = await Promise.all([
        api.getShelves(),
        api.getShelf(shelfId),
      ]);
      setShelves(shelvesData);
      setShelf(shelfDetail.shelf);
      setItems(shelfDetail.items);
    } catch (err) {
      console.error('Failed to load shelf data', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!shelf) {
    return (
      <Layout>
        <div className="text-center py-12 space-y-3">
          <p className="text-slate-600">棚が見つかりませんでした。</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
          >
            メイン画面に戻る
          </button>
        </div>
      </Layout>
    );
  }

  const shelfUrl = `${window.location.origin}/shelves/${shelf.id}`;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 -ml-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>棚の詳細</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-extrabold">
                  {shelf.name}
                </span>
              </h1>
              {shelf.description && (
                <p className="text-xs text-slate-500 mt-0.5">{shelf.description}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowQR(!showQR)}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
            title="この棚のQRコードを表示"
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">棚QRコード</span>
          </button>
        </div>

        {/* Shelf QR Code Popover */}
        {showQR && (
          <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-lg text-center space-y-3 animate-fade-in">
            <div className="flex justify-center p-3 bg-white rounded-xl inline-block border border-slate-100 shadow-sm mx-auto">
              <QRCodeSVG value={shelfUrl} size={160} level="M" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">棚 {shelf.id} 貼付用QRコード</p>
              <p className="text-xs text-slate-400 mt-0.5 break-all">{shelfUrl}</p>
            </div>
            <p className="text-xs text-slate-500">
              このQRコードを印刷して実際の棚に貼ると、スマートフォンのカメラですぐにこのページを開けます。
            </p>
          </div>
        )}

        {/* Shelf Diagram with Highlight */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            棚の位置
          </h2>
          <ShelfGrid
            shelves={shelves}
            highlightShelfId={shelf.id}
            onSelectShelf={(newId) => navigate(`/shelves/${newId}`)}
          />
        </div>

        {/* Items in this Shelf */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>この棚の備品 ({items.length}点)</span>
            </h2>

            <button
              onClick={() => navigate('/items/new')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>この棚に備品を追加</span>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              この棚には備品が登録されていません
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} showShelf={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

