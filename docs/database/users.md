# users collection

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `_id` | ObjectId | 主キー。MongoDB が自動生成 |
| `first_name` | String | 名(英語表記)。`last_name` との組み合わせに一意インデックス(大文字小文字は区別しない) |
| `last_name` | String | 姓(英語表記) |
| `grade` | String | 学年・身分(`B1`〜`B4`、`M1`、`M2`、`D1`〜`D3`、`教員`、`研究員`、`OB/OG`、`その他`) |
| `created_at` | Date | 登録日時(UTC) |
