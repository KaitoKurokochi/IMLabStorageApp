# usage_logs collection

| フィールド  | 型       | 説明                                                                                   |
| ----------- | -------- | -------------------------------------------------------------------------------------- |
| `_id`       | ObjectId | 主キー。MongoDB が自動生成                                                             |
| `item_id`   | ObjectId | 対象の備品(`items._id`)。`timestamp` との組み合わせに索引を付ける                      |
| `user_id`   | ObjectId | 操作したユーザー(`users._id`)                                                          |
| `action`    | String   | `register`(備品の登録)、`delete`(備品の削除)、`borrow`(借用)、`return`(返却)        |
| `timestamp` | Date     | 操作した日時(UTC)。`borrow` と `return` のうち最新のログが、現在の状態(使用中か、誰が使っているか)になる |
