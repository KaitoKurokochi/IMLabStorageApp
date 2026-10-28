# images collection

| フィールド     | 型       | 説明                                           |
| -------------- | -------- | ---------------------------------------------- |
| `_id`          | ObjectId | 主キー。MongoDB が自動生成                     |
| `data`         | Binary   | 画像のバイナリ(WebP に圧縮したもの)            |
| `content_type` | String   | 画像の形式(`image/webp` など)                  |
| `filename`     | String   | アップロードされたファイル名                   |
| `size`         | Number   | `data` のバイト数                              |
| `created_at`   | Date     | 保存日時(UTC)                                  |
