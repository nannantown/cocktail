# Cocktail Database

GitHubをデータベースとして活用したカクテルレシピ集です。

## データ構造

```
data/
├── cocktails.json   # カクテルレシピ一覧（メインデータ）
├── categories.json  # カテゴリマスター
├── glasses.json     # グラス種類マスター
├── methods.json     # 技法マスター（作り方の解説付き）
└── schema.json      # データスキーマ定義
```

## カクテルデータの形式

各カクテルは以下の情報を持ちます:

| フィールド | 説明 | 例 |
|---|---|---|
| `id` | 一意の識別子 | `"martini"` |
| `name` | 日本語名・英語名 | `{"ja": "マティーニ", "en": "Martini"}` |
| `category` | カテゴリ | `"short"`, `"long"`, `"tropical"` |
| `base_spirit` | ベーススピリッツ | `"gin"`, `"vodka"`, `"rum"` |
| `glass` | グラスの種類 | `"cocktail"`, `"highball"` |
| `method` | 技法 | `"shake"`, `"stir"`, `"build"` |
| `ingredients` | 材料リスト | `[{"name": "ドライジン", "amount": "45ml"}]` |
| `instructions` | 作り方の手順 | 配列で手順を記述 |
| `garnish` | ガーニッシュ | `"オリーブ"` |
| `taste` | 味わい | `"dry"`, `"sweet"`, `"sour"` |
| `alcohol_strength` | アルコール度数 | `"strong"`, `"medium"`, `"weak"` |
| `description` | 説明・由来 | 自由記述 |

## 収録カクテル一覧

### ショートカクテル
- マティーニ / マンハッタン / ギムレット / ダイキリ
- マルガリータ / ネグローニ / コスモポリタン / サイドカー
- ウイスキーサワー / エスプレッソマティーニ

### ロングカクテル
- ジントニック / モスコミュール / モヒート / スプリッツ

### トロピカル
- ピニャコラーダ / マイタイ

### その他
- オールドファッションド（スタンダード）
- B-52（ショット）
- アイリッシュコーヒー（ホット）
- シャーリーテンプル（ノンアルコール）

## 使い方

### データの取得（GitHub API経由）

```bash
# カクテル一覧を取得
curl -s https://api.github.com/repos/nannantown/cocktail/contents/data/cocktails.json \
  | jq -r '.content' | base64 -d | jq '.'

# 特定のカクテルを検索（例: gin ベース）
curl -s https://api.github.com/repos/nannantown/cocktail/contents/data/cocktails.json \
  | jq -r '.content' | base64 -d | jq '[.[] | select(.base_spirit == "gin")]'
```

### データの追加

`data/cocktails.json` に新しいカクテルオブジェクトを追加してください。`data/schema.json` のスキーマに従ってください。

## ライセンス

データは自由にご利用ください。
