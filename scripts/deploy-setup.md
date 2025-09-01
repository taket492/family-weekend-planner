# 本番環境セットアップ手順

## 1. Vercel環境変数設定

Vercelダッシュボードで以下の環境変数を設定：

```
DATABASE_URL=postgresql://username:password@hostname:port/database_name
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GURUNAVI_API_KEY=your_gurunavi_api_key  
HOTPEPPER_API_KEY=your_hotpepper_api_key
```

## 2. 本番データベースセットアップ

PostgreSQL用スキーマで本番データベースを初期化：

```bash
# 本番用スキーマをコピー
cp prisma/schema.production.prisma prisma/schema.prisma

# 本番データベースに適用
DATABASE_URL="your_production_postgres_url" npx prisma db push

# 本番データベースのスキーマを確認
DATABASE_URL="your_production_postgres_url" npx prisma studio
```

## 3. ローカル開発環境に戻す

```bash
# SQLite用スキーマに戻す
git checkout prisma/schema.prisma

# ローカル開発を継続
npm run dev
```

## 注意事項

- 本番ではPostgreSQL、ローカルではSQLiteを使用
- `tags`フィールド: PostgreSQLでは`String[]`、SQLiteでは`String?`
- Vercelデプロイ時は自動的に本番用の`DATABASE_URL`が使用される