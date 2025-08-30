# 家族週末プランナー

子連れ向けのお出かけスポットを検索してプランを作成できるWebアプリケーションです。

## 🚀 デプロイ手順

### 1. Vercelアカウント作成
https://vercel.com でアカウントを作成してください。

### 2. データベース設定（Supabase）
1. https://supabase.com でプロジェクト作成
2. Settings > Database でPostgreSQL接続文字列を取得
3. Vercelの環境変数に設定：
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
   ```

### 3. API設定（オプション）
Google Maps APIキーを取得して環境変数に設定：
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 4. Vercelデプロイ
1. GitHubにリポジトリをプッシュ
2. Vercelで「New Project」からGitHubリポジトリを選択
3. 環境変数を設定
4. デプロイ

## 🛠 ローカル開発

```bash
# 依存関係インストール
npm install

# データベース設定
npx prisma db push

# サンプルデータ投入
curl -X POST http://localhost:3000/api/seed

# 開発サーバー起動
npm run dev
```

## 📱 主要機能

- 🗺️ 地域選択（現在地・住所検索）
- 🏠 子連れ向けフィルタリング
- 🍽️ カテゴリ別スポット検索
- 📋 プラン作成・保存
- ⭐ レビュー・評価表示

## 🏗️ 技術スタック

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma
- **Database**: PostgreSQL (Supabase)
- **State**: Zustand
- **Forms**: React Hook Form
- **Deployment**: Vercel