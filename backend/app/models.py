from datetime import datetime
from typing import Annotated, Optional, Literal
from pydantic import AliasChoices, BaseModel, BeforeValidator, ConfigDict, Field, StringConstraints

# ---------------- Common ----------------
# MongoDB の ObjectId を API では文字列として扱う
PyObjectId = Annotated[str, BeforeValidator(str)]

# ---------------- Users ----------------
NameStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

GradeType = Literal[
    "B1", "B2", "B3", "B4",
    "M1", "M2",
    "D1", "D2", "D3",
    "教員", "研究員", "OB/OG", "その他"
]

class UserBase(BaseModel):
    first_name: NameStr = Field(..., description="名(英語表記)")
    last_name: NameStr = Field(..., description="姓(英語表記)")
    grade: GradeType = Field(..., description="学年/身分")

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    # Mongo のドキュメントは `_id`、レスポンスは `id` で出す
    id: PyObjectId = Field(validation_alias=AliasChoices("_id", "id"))
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserLoginRequest(BaseModel):
    first_name: NameStr
    last_name: NameStr

# ---------------- Shelves ----------------
class ShelfResponse(BaseModel):
    id: str  # "A-1", "A-2", etc.
    row: str  # "A", "B", "C"
    col: int  # 1, 2, 3
    name: str  # "棚 A-1"
    description: Optional[str] = ""
    item_count: int = 0
    available_count: int = 0

# ---------------- Items ----------------
ItemStatus = Literal["available", "in_use"]

class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, description="備品名")
    shelf_id: str = Field(..., description="保管棚ID (例: A-1)")
    category: Optional[str] = Field(default="その他", description="ジャンル/カテゴリ")
    description: Optional[str] = Field(default="", description="詳細情報")
    image_url: Optional[str] = Field(default=None, description="備品画像URL")

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    shelf_id: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class ItemResponse(ItemBase):
    id: str
    status: ItemStatus = "available"
    current_user_id: Optional[str] = None
    current_user_name: Optional[str] = None
    last_user_name: Optional[str] = None
    last_used_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class ItemBorrowRequest(BaseModel):
    user_id: str

# ---------------- Usage Logs ----------------
class UsageLogResponse(BaseModel):
    id: str
    item_id: str
    item_name: str
    user_id: str
    user_name: str
    action: Literal["borrow", "return"]
    timestamp: datetime

