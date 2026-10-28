# items collection

| フィールド        | 型               | 説明                                                                                     |
| ----------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| `_id`             | ObjectId         | 主キー。MongoDB が自動生成                                                               |
| `name`            | String           | 備品名                                                                                   |
| `shelf_id`        | ObjectId         | 保管棚(`shelves._id`)                                                                    |
| `category`        | String           | ジャンル                                                                                 |
| `description`     | String           | 詳細情報                                                                                 |
| `image_id`        | ObjectId \| null | 備品画像(`images._id`)                                                                   |
| `created_at`      | Date             | 登録日時(UTC)                                                                            |
| `updated_at`      | Date             | 更新日時(UTC)                                                                            |
| `deleted_at`      | Date \| null     | 削除日時(UTC)。`null` でなければ削除済みで、通常の一覧には出さない(論理削除)             |
