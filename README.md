# Cocktail Database

家庭でカクテルを作るための実用的なデータベースです。GitHubをデータベースとして活用し、必要なボトル・器具・レシピを管理します。

## データ構造

```
data/
├── cocktails.json   # カクテルレシピ（20種類）
├── bottles.json     # ボトル・材料マスター（45種類）
├── tools.json       # バーツール・グラスマスター（20種類）
├── categories.json  # カテゴリマスター
└── schema.json      # データスキーマ定義
```

## データの関連性

```
cocktails.json
  ├── ingredients[].bottle_id  →  bottles.json の id
  ├── garnish[].bottle_id      →  bottles.json の id
  └── required_tools[]         →  tools.json の id
```

カクテルから「何を買えばいいか」「何の器具が必要か」が辿れるようになっています。

## ボトル・材料（bottles.json）

各ボトルには以下の家庭向け情報が含まれます:

| フィールド | 説明 |
|---|---|
| `type` | 種類（spirit / liqueur / vermouth / bitters / mixer / juice / syrup / fresh / garnish / pantry） |
| `storage` | 保存方法（常温 / 冷蔵） |
| `shelf_life` | 開封後の保存期間 |
| `priority` | ホームバーでの重要度（essential / recommended / optional） |
| `price_range` | 価格帯の目安 |
| `home_bar_note` | 家庭で使う際のアドバイス |
| `recommended_brands` | おすすめブランド |

### まず揃えたいボトル（essential）

| ボトル | 作れるカクテル例 |
|---|---|
| ドライジン | マティーニ、ギムレット、ジントニック、ネグローニ |
| ウォッカ | モスコミュール、エスプレッソマティーニ |
| ホワイトラム | ダイキリ、モヒート、ピニャコラーダ |
| バーボン | オールドファッションド、ウイスキーサワー |
| コアントロー | マルガリータ、コスモポリタン、サイドカー |
| ドライベルモット | マティーニ |
| アンゴスチュラビターズ | マンハッタン、オールドファッションド |
| ライム・レモン（生） | ほぼ全てのカクテル |
| シュガーシロップ | ギムレット、ダイキリ、モヒートなど |
| トニックウォーター | ジントニック |
| 炭酸水 | モヒート、スプリッツなど |

## バーツール・グラス（tools.json）

器具は `category` で分類されています:
- **mixing**: シェーカー、ミキシンググラス、バースプーンなど
- **measuring**: ジガー（メジャーカップ）
- **garnish**: ピーラー
- **glassware**: カクテルグラス、ロックグラス、ハイボールグラスなど
- **other**: 製氷皿

### まず揃えたい器具（essential）

| 器具 | 用途 |
|---|---|
| シェーカー | シェークカクテル全般 |
| バースプーン | ステア、ビルド全般 |
| ジガー | 分量の計量（全カクテルに必須） |
| カクテルグラス | マティーニ、ギムレットなどショートカクテル |
| ロックグラス | オールドファッションド、ネグローニなど |
| ハイボールグラス | ジントニックなどロングカクテル |
| 製氷皿 | 大きめの氷作り |

## カクテルレシピ（cocktails.json）

各レシピは `bottle_id` と `required_tools` でマスターデータを参照しています。

### 収録カクテル（20種類）

| カテゴリ | カクテル |
|---|---|
| ショート | マティーニ、マンハッタン、ギムレット、ダイキリ、マルガリータ、ネグローニ、コスモポリタン、サイドカー、ウイスキーサワー、エスプレッソマティーニ |
| ロング | ジントニック、モスコミュール、モヒート、スプリッツ |
| トロピカル | ピニャコラーダ、マイタイ |
| スタンダード | オールドファッションド |
| ショット | B-52 |
| ホット | アイリッシュコーヒー |
| ノンアルコール | シャーリーテンプル |

## 使い方

### GitHub API でデータ取得

```bash
# カクテル一覧を取得
curl -s https://api.github.com/repos/nannantown/cocktail/contents/data/cocktails.json \
  | jq -r '.content' | base64 -d | jq '.'

# 手持ちのボトルで作れるカクテルを検索（例: dry-gin を持っている場合）
curl -s https://api.github.com/repos/nannantown/cocktail/contents/data/cocktails.json \
  | jq -r '.content' | base64 -d \
  | jq '[.[] | select(.ingredients[].bottle_id == "dry-gin")]'

# 必須ボトルだけ一覧表示
curl -s https://api.github.com/repos/nannantown/cocktail/contents/data/bottles.json \
  | jq -r '.content' | base64 -d \
  | jq '[.[] | select(.priority == "essential") | {id, name: .name.ja, type}]'

# シェーカーが必要なカクテル一覧
curl -s https://api.github.com/repos/nannantown/cocktail/contents/data/cocktails.json \
  | jq -r '.content' | base64 -d \
  | jq '[.[] | select(.required_tools[] == "shaker") | .name.ja]'
```

### データの追加

`data/cocktails.json` に新しいカクテルを追加する場合:
1. `data/schema.json` のスキーマに従う
2. `ingredients[].bottle_id` は `bottles.json` の既存IDを使う（新しい材料が必要なら `bottles.json` にも追加）
3. `required_tools[]` は `tools.json` の既存IDを使う

## ライセンス

データは自由にご利用ください。
