# 杉本研究室 備品管理システム (IMLabStorageApp)

`docs/spec.md` の仕様に準拠した、杉本研究室の備品状況を誰でも手軽に一目で把握・記録できる3層モノレポWebアプリケーションです。

---

## 1. システム構成

- **フロントエンド (`frontend/`)**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, html5-qrcode, qrcode.react
- **バックエンド (`backend/`)**: FastAPI, Pydantic v2, Uvicorn, Motor, Python-multipart
- **データベース (`database`)**: MongoDB (Motor非同期接続)。MongoDB未起動時にも即座に動作する自動ファイルリポジトリ(`backend/data/db.json`)フォールバックを内蔵。

---

## 2. ページ一覧・機能対応表

| # | ページ名 | パス | 実装内容 |
|---|---|---|---|
| 1 | **メイン画面** | `/` | 左上メニュー `[=]`、右上QR読み取り `[QR]`、検索バー(リアルタイム検索)、3×3棚マップ(区画タップで詳細へ) |
| 2 | **備品登録画面** | `/items/new` | 備品名、棚位置選択(A-1〜C-3)、カテゴリ選択、画像アップロード・プレビュー、詳細情報入力 |
| 3 | **ログイン画面** | `/login` | 名前入力、学年ドロップダウン選択、ログインボタン、新規登録リンク、登録済みユーザーからのワンタップ選択 |
| 4 | **ユーザー登録画面** | `/users/new` | 名前入力、学年選択、登録ボタン(登録後自動ログイン) |
| 5 | **ユーザーページ** | `/users/:id` | ユーザー情報(名前・学年)、借りている備品リスト、備品のワンタップ返却、利用履歴 |
| 6 | **棚の詳細ページ** | `/shelves/:id` | 棚の位置(3×3マップで対象区画を `[A-1]` 強調)、棚の備品一覧(状態表示)、棚QRコード生成・表示 |
| 7 | **アイテムの詳細ページ** | `/items/:id` | 備品名、現在の状況(使用中/貸出可能バッジ)、画像、詳細情報(棚位置・最後に使用した人)、**使用ボタン**・**返却ボタン**、備品QRコード生成・表示、利用履歴 |
| 8 | **全備品一覧画面** | `/items` | **JSONダウンロードボタン**、**CSVダウンロードボタン**(Excel対応BOM付き)、状態/保管棚/カテゴリ絞り込み、備品リスト |

---

## 3. 環境変数と設定 (.env)

本プロジェクトは設定を環境変数（`.env`）で一元管理しています。各ディレクトリに `.env.example` を用意しています。

- **バックエンド (`backend/.env`)**:
  - `APP_ENV`: 動作環境 (`development` / `production`)
  - `HOST`, `PORT`: 起動ホストとポート番号 (デフォルト `0.0.0.0:8000`)
  - `MONGODB_URL`: MongoDB接続文字列 (デフォルト `mongodb://localhost:27017`)
  - `DATABASE_NAME`: 使用データベース名 (`imlab_storage`)
  - `CORS_ORIGINS`: 許可するオリジン (カンマ区切りまたは `*`)
  - `UPLOAD_DIR`: アップロード画像保存先ディレクトリ

- **フロントエンド (`frontend/.env`)**:
  - `VITE_API_BASE_URL`: バックエンドAPIのURL (Viteプロキシ使用時は空文字、別ホスト運用時は `https://api.example.com` 等を指定)
  - `VITE_PORT`: フロントエンド開発サーバーのポート番号 (デフォルト `5173`)
  - `BACKEND_PROXY_TARGET`: 開発環境でのバックエンドプロキシ先 (デフォルト `http://127.0.0.1:8000`)

※ `.env` ファイルは機密情報を含む可能性があるため `.gitignore` で除外されており、Gitには `.env.example` のみがコミットされます。

---

## 4. クイックスタート & デプロイ

### 開発時のワンクリック起動 (推奨)
```bash
./start.sh
```
バックエンド(FastAPI: `http://localhost:8000`)とフロントエンド(Vite: `http://localhost:5173`)が同時に立ち上がります。

### Docker Compose による本番デプロイ
MongoDB、FastAPIバックエンド、Nginx + フロントエンドSPAを1コマンドで一括起動できます。
```bash
docker compose up -d --build
```
- アプリケーション (フロントエンド): `http://localhost` (ポート80)
- APIサーバー: `http://localhost:8000` (または Nginx経由 `http://localhost/api`)

### 手動での個別起動

#### バックエンド
```bash
cd backend
PYTHONPATH=. .venv/bin/python run.py
```
APIサーバーが `http://localhost:8000` で起動します。
- Swagger UI (APIドキュメント): `http://localhost:8000/docs`

#### フロントエンド
```bash
cd frontend
export PATH="$HOME/.nvm/versions/node/v24.22.1/bin:$PATH"
npm run dev
```
ブラウザで `http://localhost:5173` を開いてください。

---

## 4. データベースについて

- デフォルトでローカルのMongoDB (`mongodb://localhost:27017/imlab_storage`) に接続を試みます。
- MongoDBが起動していない場合でも自動的に `backend/data/db.json` による永続化フォールバックが稼働し、エラーなく全機能が使用可能です。
- 初期データとして、9区画の棚(A-1〜C-3)、サンプル備品(Meta Quest 3, RTX 4090, Arduino等)、初期ユーザーがあらかじめシードされています。

---

## 5. 主な仕様・特徴

1. **直感的な3×3棚マップ**:
   - 杉本研究室の物理棚レイアウト(上段A、中段B、下段C × 3列)を模したUI。各区画の備品数・貸出可能数が一目で分かります。
2. **QRコード連携**:
   - 右上の `[QR]` ボタンからカメラでのQRコードスキャン、またはQR画像読み取り、コード手動入力が可能。
   - 棚詳細ページおよび備品詳細ページには「貼付用QRコード」の表示・印刷用機能があり、物理棚や備品本体に貼ることでスマホからワンタップアクセスできます。
3. **エクスポート機能**:
   - 全備品一覧画面から `JSON` および `CSV` (日本語文字化け防止UTF-8 BOM付き)で全備品データをダウンロード可能。
4. **レスポンシブデザイン**:
   - 研究室のPCだけでなく、実験室・棚前で操作するスマートフォンやタブレットにも最適化。

