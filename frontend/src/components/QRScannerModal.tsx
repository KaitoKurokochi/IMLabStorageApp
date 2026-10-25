import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Image, ArrowRight, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [manualInput, setManualInput] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader-container';

  const handleDetected = (decodedText: string) => {
    // Process text
    stopScanner();
    onClose();

    // Check if it's a URL or an ID
    try {
      if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
        const url = new URL(decodedText);
        navigate(url.pathname);
        return;
      }
    } catch {
      // not a full url
    }

    if (decodedText.startsWith('/')) {
      navigate(decodedText);
      return;
    }

    // If it looks like shelf ID e.g. "A-1" or "shelves/A-1"
    const clean = decodedText.trim();
    if (/^[A-C]-[1-3]$/i.test(clean)) {
      navigate(`/shelves/${clean.toUpperCase()}`);
    } else if (clean.startsWith('item-')) {
      navigate(`/items/${clean}`);
    } else {
      // fallback to search or direct path
      navigate(`/items/${clean}`);
    }
  };

  const startScanner = async () => {
    setScanError(null);
    try {
      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;
      setIsScanning(true);

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleDetected(decodedText);
        },
        () => {
          // parse error per frame, ignore
        }
      );
    } catch (err: any) {
      console.warn('Camera scan failed to start:', err);
      setScanError(err?.message || 'カメラを起動できませんでした。ファイル選択または手動入力をお試しください。');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScanError(null);
      const html5QrCode = new Html5Qrcode('qr-file-dummy');
      const result = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      handleDetected(result);
    } catch (err: any) {
      setScanError('画像からQRコードを読み取れませんでした。');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleDetected(manualInput.trim());
  };

  useEffect(() => {
    if (isOpen) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div id="qr-file-dummy" className="hidden"></div>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">QRコード読み取り</h2>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-square flex items-center justify-center shadow-inner">
            <div id={containerId} className="w-full h-full" />
            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900/90">
                <Camera className="w-12 h-12 text-slate-400 mb-2 animate-pulse" />
                <p className="text-sm text-slate-300">カメラ準備中、または利用できません</p>
                {scanError && (
                  <p className="text-xs text-rose-300 mt-2 bg-rose-950/50 p-2 rounded border border-rose-800">
                    {scanError}
                  </p>
                )}
                <button
                  onClick={startScanner}
                  className="mt-4 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
                >
                  カメラ再試行
                </button>
              </div>
            )}
          </div>

          {/* Alternative: Image Upload */}
          <div>
            <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 cursor-pointer transition">
              <Image className="w-4 h-4" />
              <span>写真・画像ファイルからQRコードを読み込む</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Alternative: Manual Input */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2 font-medium">棚番号 (例: A-1) または備品IDを直接入力:</p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="A-1, B-2 または備品ID"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center gap-1 transition"
              >
                <span>開く</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

