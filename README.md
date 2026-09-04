# NIKKE Buff Atlas — キャラクター比較辞典

NIKKEのSkill Lv.10 **Raw Value**専用のバフ辞典です。実効DPS、維持率、実戦の補正は計算しません。キャラクターとバフを分離し、`character_id` で関連付けています。

## Features

- **比較辞典**：カテゴリ・SELF/ALLY・単位ごとに横1行で比較。Stackは1スタック値を主表示
- **Formation Resolver**：5人編成・Burst Rotation・対象指定から、適用効果をdeterministic／conditional／unknownに分類
- **Buff Axis Coverage**：強化軸の重複と不足を可視化（合算は同一軸・同一単位のみ、実効値ではない）
- **Reviewワークフロー**：未確定の節を原文付きで確認・承認・除外（ローカル保存）

## License

このリポジトリのオリジナルコード（UI、モデル、Resolver、パーサー、スクリプト、テスト、スキーマ、手入力メタデータ）はMITライセンス（`LICENSE` 参照）のもとで提供されます。MITライセンスは本リポジトリのオリジナルコードのみを対象とします。NIKKEのゲームデータ、キャラクター名、スキル文、数値、画像、商標、その他第三者コンテンツ等について、本プロジェクトは何らの権利も主張するものではなく、それらの権利は各権利者に帰属します。収集済みデータ（`data/` の生成物等）は公開リポジトリに含めず、各自の環境で取得・再生成してください（下記「公開リポジトリとデータ方針」参照）。

## 公開リポジトリとデータ方針

収集済みデータ（`data/` の生成物、`work/` の取得キャッシュ）は第三者ソースの実質的再配布になり得るため、公開リポジトリには含めません（`.gitignore` 参照）。公開物だけで動作確認するには以下を使います。

- `node scripts/seed-demo-data.mjs`：架空3キャラ・4効果の最小データを `data/` へ生成（既存ファイルは上書きしません、`--force` で上書き）
- `npm test`：公開fixtureのみで成立する単体テスト
- `npm run test:data`：実データ検証（`data/` 不在時はskip）
- `npm run collect`：各自の環境でNIKKE.GG／Nikke Explorerから取得して正規データを再生成（ネットワーク必要、出典の利用条件に従うこと）

## セットアップ

要件：Node.js 22以上。依存パッケージはありません（`npm install` 不要）。

```sh
node scripts/seed-demo-data.mjs  # demoデータ生成（初回のみ）
npm test                         # 単体テスト
python -m http.server 4173       # HTTP配信（ES modulesのためfile://直起動は不可）
```

ブラウザで `http://127.0.0.1:4173/` を開きます。実データを収集した場合は `npm run collect` 後に同じ手順で表示できます。

## コマンド一覧

| コマンド | 用途 |
| --- | --- |
| `npm test` | 公開fixtureのみの単体テスト（`tests/*.test.mjs`） |
| `npm run test:data` | 実データ検証（`tests/data/*.test.mjs`、`data/` 不在時はskip） |
| `npm run build` | `dist/` に静的配布物を作成（`data/` がなければdemoでseed） |
| `npm run validate:data` | スキーマ・ID参照・単位・出典の検証 |
| `npm run verify-data` | networkなしの正規監査（schema・境界・回帰test・build） |
| `npm run collect` | 正規データの再収集（ネットワーク必要） |
| `npm run collect:offline` | 保存済みキャッシュから再生成 |
| `npm run update-data` | 増分更新パイプライン（詳細は `CONTRIBUTING.md`） |
| `npm run review:serve` | ローカル保存サービス＋サイト（`http://127.0.0.1:4174/`） |

## データ契約（概要）

`data/` の正規ファイルは収集時に生成されます（公開リポジトリには含まれません）。追跡対象の手入力は `data/character-overrides.json`（出典付き実装日）、`data/reviewed-skills.json`、`data/review-decisions.json`、スキーマ類（`character-schema.json`、`effect-schema.json`）です。効果レコードは `character_id` でキャラクターと関連付け、`source_type`／`source_url`／`source_checked_at` を必須とします。詳細な収集・更新・レビュー手順は `CONTRIBUTING.md` を参照してください。
