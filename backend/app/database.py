import os
import json
import uuid
import base64
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError
from app.config import settings

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DATA_FILE = os.path.join(DATA_DIR, "db.json")
os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_SHELVES = [
    {"id": "A-1", "row": "A", "col": 1, "name": "棚 A-1", "description": "上段 1列目 (VR・HMD関連)"},
    {"id": "A-2", "row": "A", "col": 2, "name": "棚 A-2", "description": "上段 2列目 (コントローラ・センサ)"},
    {"id": "A-3", "row": "A", "col": 3, "name": "棚 A-3", "description": "上段 3列目 (光学機器・カメラ)"},
    {"id": "A-4", "row": "A", "col": 4, "name": "棚 A-4", "description": "上段 4列目"},
    {"id": "A-5", "row": "A", "col": 5, "name": "棚 A-5", "description": "上段 5列目"},
    {"id": "A-6-1", "row": "A", "col": 6, "name": "棚 A-6-1", "description": "上段 6列目 下段左"},
    {"id": "A-6-2", "row": "A", "col": 6, "name": "棚 A-6-2", "description": "上段 6列目 下段右"},
    {"id": "B-1", "row": "B", "col": 1, "name": "棚 B-1", "description": "中段 1列目 (GPU・PCパーツ)"},
    {"id": "B-2", "row": "B", "col": 2, "name": "棚 B-2", "description": "中段 2列目 (マイコン・基板)"},
    {"id": "B-3-1", "row": "B", "col": 3, "name": "棚 B-3-1", "description": "中段 3列目 左上 (2x2)"},
    {"id": "B-3-2", "row": "B", "col": 3, "name": "棚 B-3-2", "description": "中段 3列目 右上 (2x2)"},
    {"id": "B-3-3", "row": "B", "col": 3, "name": "棚 B-3-3", "description": "中段 3列目 左下 (2x2)"},
    {"id": "B-3-4", "row": "B", "col": 3, "name": "棚 B-3-4", "description": "中段 3列目 右下 (2x2)"},
    {"id": "B-4-1", "row": "B", "col": 4, "name": "棚 B-4-1", "description": "中段 4列目 左上 (2x2)"},
    {"id": "B-4-2", "row": "B", "col": 4, "name": "棚 B-4-2", "description": "中段 4列目 右上 (2x2)"},
    {"id": "B-4-3", "row": "B", "col": 4, "name": "棚 B-4-3", "description": "中段 4列目 左下 (2x2)"},
    {"id": "B-4-4", "row": "B", "col": 4, "name": "棚 B-4-4", "description": "中段 4列目 右下 (2x2)"},
    {"id": "B-5", "row": "B", "col": 5, "name": "棚 B-5", "description": "中段 5列目"},
    {"id": "B-6", "row": "B", "col": 6, "name": "棚 B-6", "description": "中段 6列目 (ケーブル・変換アダプタ)"},
    {"id": "C-1", "row": "C", "col": 1, "name": "棚 C-1", "description": "下段 1列目 (電動工具・工作用具)"},
    {"id": "C-2", "row": "C", "col": 2, "name": "棚 C-2", "description": "下段 2列目 (3Dプリンタ備品・フィラメント)"},
    {"id": "C-3", "row": "C", "col": 3, "name": "棚 C-3", "description": "下段 3列目 (計測器・オシロスコープ)"},
    {"id": "C-4", "row": "C", "col": 4, "name": "棚 C-4", "description": "下段 4列目"},
    {"id": "C-5", "row": "C", "col": 5, "name": "棚 C-5", "description": "下段 5列目"},
    {"id": "C-6-1", "row": "C", "col": 6, "name": "棚 C-6-1", "description": "下段 6列目 1段目左 (3x2)"},
    {"id": "C-6-2", "row": "C", "col": 6, "name": "棚 C-6-2", "description": "下段 6列目 1段目右 (3x2)"},
    {"id": "C-6-3", "row": "C", "col": 6, "name": "棚 C-6-3", "description": "下段 6列目 2段目左 (3x2)"},
    {"id": "C-6-4", "row": "C", "col": 6, "name": "棚 C-6-4", "description": "下段 6列目 2段目右 (3x2)"},
    {"id": "C-6-5", "row": "C", "col": 6, "name": "棚 C-6-5", "description": "下段 6列目 3段目左 (3x2)"},
    {"id": "C-6-6", "row": "C", "col": 6, "name": "棚 C-6-6", "description": "下段 6列目 3段目右 (3x2)"},
]

DEFAULT_USERS = [
    {"id": "user-1", "name": "杉本 教授", "grade": "教員", "created_at": datetime.now().isoformat()},
    {"id": "user-2", "name": "山田 太郎", "grade": "M1", "created_at": datetime.now().isoformat()},
    {"id": "user-3", "name": "佐藤 花子", "grade": "B4", "created_at": datetime.now().isoformat()},
]

DEFAULT_ITEMS = [
    {
        "id": "item-1",
        "name": "Meta Quest 3 (128GB)",
        "shelf_id": "A-1",
        "category": "VR",
        "description": "研究用スタンドアロンVRヘッドセット。両手コントローラ・充電器付属。",
        "image_url": "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&auto=format&fit=crop&q=80",
        "status": "in_use",
        "current_user_id": "user-2",
        "current_user_name": "山田 太郎",
        "last_user_name": "山田 太郎",
        "last_used_at": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    },
    {
        "id": "item-2",
        "name": "HTC Vive Pro 2 フルセット",
        "shelf_id": "A-1",
        "category": "VR",
        "description": "ベースステーション2.0 ×2、コントローラ×2同梱。PC接続用DisplayPortケーブルあり。",
        "image_url": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=600&auto=format&fit=crop&q=80",
        "status": "available",
        "current_user_id": None,
        "current_user_name": None,
        "last_user_name": "山田 太郎",
        "last_used_at": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    },
    {
        "id": "item-3",
        "name": "NVIDIA GeForce RTX 4090",
        "shelf_id": "B-1",
        "category": "GPU/PC",
        "description": "深層学習実験用GPU。16ピン電源変換コネクタ付属。静電防止袋に保管のこと。",
        "image_url": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80",
        "status": "available",
        "current_user_id": None,
        "current_user_name": None,
        "last_user_name": "佐藤 花子",
        "last_used_at": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    },
    {
        "id": "item-4",
        "name": "Arduino Uno R3 スターターキット",
        "shelf_id": "B-2",
        "category": "基板/センサ",
        "description": "ブレッドボード、ジャンパ線、基本センサ類一式がケースに収納されています。",
        "image_url": "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80",
        "status": "available",
        "current_user_id": None,
        "current_user_name": None,
        "last_user_name": None,
        "last_used_at": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    },
    {
        "id": "item-5",
        "name": "Bambu Lab PLA フィラメント (白)",
        "shelf_id": "C-2",
        "category": "3Dプリンタ",
        "description": "1.75mm 高速PLAフィラメント。乾燥剤と一緒に密封バッグで保管してください。",
        "image_url": "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&auto=format&fit=crop&q=80",
        "status": "available",
        "current_user_id": None,
        "current_user_name": None,
        "last_user_name": None,
        "last_used_at": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    },
    {
        "id": "item-6",
        "name": "Rigol デジタルオシロスコープ 100MHz",
        "shelf_id": "C-3",
        "category": "計測器",
        "description": "DS1102Z-E 2ch 100MHz。プローブ2本付属。精密機器のため取り扱い注意。",
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80",
        "status": "available",
        "current_user_id": None,
        "current_user_name": None,
        "last_user_name": "杉本 教授",
        "last_used_at": datetime.now().isoformat(),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }
]

DEFAULT_LOGS = [
    {
        "id": "log-1",
        "item_id": "item-1",
        "item_name": "Meta Quest 3 (128GB)",
        "user_id": "user-2",
        "user_name": "山田 太郎",
        "action": "borrow",
        "timestamp": datetime.now().isoformat()
    }
]

class DatabaseManager:
    def __init__(self):
        self.is_mongo = False
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self._memory_data: Dict[str, List[Dict[str, Any]]] = {}
        self._lock = asyncio.Lock()

    async def connect(self):
        """Attempts to connect to MongoDB, falls back to local JSON storage."""
        try:
            client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=1500
            )
            # Check connection
            await client.admin.command('ping')
            self.client = client
            self.db = client[settings.DATABASE_NAME]
            self.is_mongo = True
            print(" Connected to MongoDB successfully.")
            await self._seed_mongo_if_empty()
        except Exception as e:
            print(f"⚠️ MongoDB connection failed ({e}). Using file-backed JSON repository at {DATA_FILE}")
            self.is_mongo = False
            self._load_file_data()

    def _load_file_data(self):
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    self._memory_data = json.load(f)
                    return
            except Exception as e:
                print(f"Error loading {DATA_FILE}: {e}")
        
        self._memory_data = {
            "shelves": DEFAULT_SHELVES,
            "users": DEFAULT_USERS,
            "items": DEFAULT_ITEMS,
            "usage_logs": DEFAULT_LOGS,
        }
        self._save_file_data()

    def _save_file_data(self):
        try:
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(self._memory_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving {DATA_FILE}: {e}")

    async def _seed_mongo_if_empty(self):
        if not self.is_mongo:
            return
        shelves_count = await self.db.shelves.count_documents({})
        if shelves_count == 0:
            print("🌱 Seeding MongoDB initial data...")
            await self.db.shelves.insert_many([dict(s, _id=s["id"]) for s in DEFAULT_SHELVES])
            await self.db.users.insert_many([dict(u, _id=u["id"]) for u in DEFAULT_USERS])
            await self.db.items.insert_many([dict(i, _id=i["id"]) for i in DEFAULT_ITEMS])
            await self.db.usage_logs.insert_many([dict(l, _id=l["id"]) for l in DEFAULT_LOGS])

    # ---------------- Shelves ----------------
    async def get_shelves(self) -> List[Dict[str, Any]]:
        if self.is_mongo:
            cursor = self.db.shelves.find()
            shelves = []
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                shelves.append(doc)
        else:
            shelves = list(self._memory_data.get("shelves", []))

        # Attach item counts
        items = await self.get_items()
        for shelf in shelves:
            shelf_items = [i for i in items if i.get("shelf_id") == shelf["id"]]
            shelf["item_count"] = len(shelf_items)
            shelf["available_count"] = len([i for i in shelf_items if i.get("status") == "available"])
        
        return sorted(shelves, key=lambda s: (s.get("row", ""), s.get("col", 0), s.get("id", "")))

    async def get_shelf(self, shelf_id: str) -> Optional[Dict[str, Any]]:
        shelves = await self.get_shelves()
        for s in shelves:
            if s["id"] == shelf_id:
                return s
        return None

    # ---------------- Users ----------------
    async def get_users(self) -> List[Dict[str, Any]]:
        if self.is_mongo:
            cursor = self.db.users.find()
            users = []
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                users.append(doc)
            return users
        else:
            return list(self._memory_data.get("users", []))

    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.is_mongo:
            doc = await self.db.users.find_one({"$or": [{"_id": user_id}, {"id": user_id}]})
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
            return None
        else:
            for u in self._memory_data.get("users", []):
                if u["id"] == user_id:
                    return u
            return None

    async def find_user_by_name_grade(self, name: str, grade: str) -> Optional[Dict[str, Any]]:
        if self.is_mongo:
            doc = await self.db.users.find_one({"name": name, "grade": grade})
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
            return None
        else:
            for u in self._memory_data.get("users", []):
                if u["name"] == name and u["grade"] == grade:
                    return u
            return None

    async def create_user(self, name: str, grade: str) -> Dict[str, Any]:
        async with self._lock:
            user_id = f"user-{uuid.uuid4().hex[:8]}"
            user = {
                "id": user_id,
                "name": name,
                "grade": grade,
                "created_at": datetime.now().isoformat()
            }
            if self.is_mongo:
                await self.db.users.insert_one(dict(user, _id=user_id))
            else:
                self._memory_data.setdefault("users", []).append(user)
                self._save_file_data()
            return user

    # ---------------- Items ----------------
    async def get_items(
        self,
        shelf_id: Optional[str] = None,
        query: Optional[str] = None,
        status: Optional[str] = None,
        category: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        if self.is_mongo:
            mongo_filter: Dict[str, Any] = {}
            if shelf_id:
                mongo_filter["shelf_id"] = shelf_id
            if status:
                mongo_filter["status"] = status
            if category:
                mongo_filter["category"] = category
            if user_id:
                mongo_filter["current_user_id"] = user_id
            cursor = self.db.items.find(mongo_filter)
            items = []
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                items.append(doc)
        else:
            items = list(self._memory_data.get("items", []))
            if shelf_id:
                items = [i for i in items if i.get("shelf_id") == shelf_id]
            if status:
                items = [i for i in items if i.get("status") == status]
            if category:
                items = [i for i in items if i.get("category") == category]
            if user_id:
                items = [i for i in items if i.get("current_user_id") == user_id]

        if query:
            q = query.lower()
            items = [
                i for i in items
                if q in i.get("name", "").lower()
                or q in i.get("description", "").lower()
                or q in i.get("shelf_id", "").lower()
                or q in i.get("category", "").lower()
                or q in (i.get("current_user_name") or "").lower()
                or q in (i.get("last_user_name") or "").lower()
            ]
        return items

    async def get_item(self, item_id: str) -> Optional[Dict[str, Any]]:
        if self.is_mongo:
            doc = await self.db.items.find_one({"$or": [{"_id": item_id}, {"id": item_id}]})
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
            return None
        else:
            for item in self._memory_data.get("items", []):
                if item["id"] == item_id:
                    return item
            return None

    async def create_item(self, data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            now = datetime.now().isoformat()
            item_id = f"item-{uuid.uuid4().hex[:8]}"
            item = {
                "id": item_id,
                "name": data["name"],
                "shelf_id": data["shelf_id"],
                "category": data.get("category", "その他"),
                "description": data.get("description", ""),
                "image_url": data.get("image_url"),
                "status": "available",
                "current_user_id": None,
                "current_user_name": None,
                "last_user_name": None,
                "last_used_at": None,
                "created_at": now,
                "updated_at": now,
            }
            if self.is_mongo:
                await self.db.items.insert_one(dict(item, _id=item_id))
            else:
                self._memory_data.setdefault("items", []).append(item)
                self._save_file_data()
            return item

    async def borrow_item(self, item_id: str, user_id: str, user_name: str) -> Optional[Dict[str, Any]]:
        async with self._lock:
            item = await self.get_item(item_id)
            if not item:
                return None
            
            now = datetime.now().isoformat()
            update_data = {
                "status": "in_use",
                "current_user_id": user_id,
                "current_user_name": user_name,
                "last_user_name": user_name,
                "last_used_at": now,
                "updated_at": now,
            }

            if self.is_mongo:
                await self.db.items.update_one(
                    {"$or": [{"_id": item_id}, {"id": item_id}]},
                    {"$set": update_data}
                )
            else:
                for i in self._memory_data.get("items", []):
                    if i["id"] == item_id:
                        i.update(update_data)
                        break
                self._save_file_data()

            # Record log
            await self.create_log(
                item_id=item_id,
                item_name=item["name"],
                user_id=user_id,
                user_name=user_name,
                action="borrow"
            )

            item.update(update_data)
            return item

    async def return_item(self, item_id: str, user_id: Optional[str] = None, user_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        async with self._lock:
            item = await self.get_item(item_id)
            if not item:
                return None

            now = datetime.now().isoformat()
            returned_by_name = user_name or item.get("current_user_name") or "不明"
            returned_by_id = user_id or item.get("current_user_id") or "unknown"

            update_data = {
                "status": "available",
                "current_user_id": None,
                "current_user_name": None,
                "last_user_name": returned_by_name,
                "last_used_at": now,
                "updated_at": now,
            }

            if self.is_mongo:
                await self.db.items.update_one(
                    {"$or": [{"_id": item_id}, {"id": item_id}]},
                    {"$set": update_data}
                )
            else:
                for i in self._memory_data.get("items", []):
                    if i["id"] == item_id:
                        i.update(update_data)
                        break
                self._save_file_data()

            # Record log
            await self.create_log(
                item_id=item_id,
                item_name=item["name"],
                user_id=returned_by_id,
                user_name=returned_by_name,
                action="return"
            )

            item.update(update_data)
            return item

    # ---------------- Usage Logs ----------------
    async def create_log(self, item_id: str, item_name: str, user_id: str, user_name: str, action: str) -> Dict[str, Any]:
        log_id = f"log-{uuid.uuid4().hex[:8]}"
        log_entry = {
            "id": log_id,
            "item_id": item_id,
            "item_name": item_name,
            "user_id": user_id,
            "user_name": user_name,
            "action": action,
            "timestamp": datetime.now().isoformat()
        }
        if self.is_mongo:
            await self.db.usage_logs.insert_one(dict(log_entry, _id=log_id))
        else:
            self._memory_data.setdefault("usage_logs", []).append(log_entry)
            self._save_file_data()
        return log_entry

    async def get_logs(self, item_id: Optional[str] = None, user_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        if self.is_mongo:
            query: Dict[str, Any] = {}
            if item_id:
                query["item_id"] = item_id
            if user_id:
                query["user_id"] = user_id
            cursor = self.db.usage_logs.find(query).sort("timestamp", -1).limit(limit)
            logs = []
            async for doc in cursor:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                logs.append(doc)
            return logs
        else:
            logs = list(self._memory_data.get("usage_logs", []))
            if item_id:
                logs = [l for l in logs if l.get("item_id") == item_id]
            if user_id:
                logs = [l for l in logs if l.get("user_id") == user_id]
            logs = sorted(logs, key=lambda l: l.get("timestamp", ""), reverse=True)
            return logs[:limit]

    # ---------------- Images (MongoDB Binary Storage) ----------------
    async def save_image(self, image_bytes: bytes, content_type: str = "image/webp", filename: str = "") -> str:
        image_id = f"img-{uuid.uuid4().hex[:12]}"
        now = datetime.now().isoformat()
        if self.is_mongo:
            await self.db.images.insert_one({
                "_id": image_id,
                "data": image_bytes,
                "content_type": content_type,
                "filename": filename,
                "size": len(image_bytes),
                "created_at": now
            })
        else:
            async with self._lock:
                self._memory_data.setdefault("images", {})[image_id] = {
                    "data": base64.b64encode(image_bytes).decode("ascii"),
                    "content_type": content_type,
                    "filename": filename,
                    "size": len(image_bytes),
                    "created_at": now
                }
                self._save_file_data()
        return image_id

    async def get_image(self, image_id: str) -> Optional[tuple[bytes, str]]:
        if self.is_mongo:
            doc = await self.db.images.find_one({"_id": image_id})
            if doc:
                data = doc["data"]
                return bytes(data), doc.get("content_type", "image/webp")
            return None
        else:
            img = self._memory_data.get("images", {}).get(image_id)
            if img:
                data = base64.b64decode(img["data"])
                return data, img.get("content_type", "image/webp")
            return None

db = DatabaseManager()

