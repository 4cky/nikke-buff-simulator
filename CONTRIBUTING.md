# CONTRIBUTING — 開発者向け詳細手順

本書はローカルで正規データ（`npm run collect` で再生成した `data/`）を扱う開発者向けの詳細手順です。公開リポジトリの利用者は先に `README.md` を参照してください。

## データ契約

正規の入力・出力は以下です。

| ファイル | 用途 |
| --- | --- |
| `data/characters.json` | キャラ基本情報と収録状況（収集時に生成） |
| `data/effects.json` | 比較用の1効果1レコード（収集時に生成） |
| `data/character-overrides.json` | 出典付き実装日・手動メタデータ補完の入力 |
| `data/curated-effects.json` | 手動確認済み効果の入力。収集処理は上書きしない |
| `data/reviewed-skills.json` | 全効果の手動確認が済んだスキルID。自動抽出との重複防止 |
| `data/skill-snapshots.json` | Lv.10原文・テンプレート・10番目の値・出典 |
| `data/review-queue.json` | 解釈未確定の節と理由。`needs_review: true` |
| `data/review-items.json` | 対象外・抽出済み・人間の確認済みを含む全確認項目。原文は消さない |
| `data/review-report.json` | 理由別・状態別件数、原文変更アラート数 |
| `data/unknown-reclassification-report.json` | 人間が分類したUnknown種類の振り分け件数と、推測せず残した未分類候補 |
| `data/review-decisions.json` | 人間の判断を永続化する入力。revision・決定・操作履歴を保存 |
| `data/collection-report.json` | 収集日時・件数・除外枠・ソースハッシュ |
| `data/slot-source-status.json` | 全キャラの3枠それぞれの取得可否・採用ソース・原文ハッシュ |
| `data/source-comparisons.json` | 両ソースのLv.10原文・確認日時・照合結果 |
| `data/source-conflicts.json` | 数値不一致の両原文と値。自動上書きしない |
| `data/source-history.json` | 原文変更とソース移行の前後スナップショット |
| `data/raw-source-snapshots.json` | character単位の採用Lv.10原文・slot別hash。parser出力と分離した再解析用baseline |
| `data/dataset-manifest.json` | parser version・生成日時・構造化／比較／対象外／Review件数・全source hash |
| `data/data-generation-history.json` | quality gateを通過して適用されたgeneration履歴 |
| `data/source-change-report.json` | skill単位のold/new原文とhash差分 |
| `data/character-schema.json` / `data/effect-schema.json` | 現行スキーマ |

旧 `data/buffs.json` / `data/schema.json` は移行前MVPの回帰テスト用で、アプリは読み込みません。

`effects.json` では以下の元フィールドを維持し、`character_id`、`effect_id`、`skill_level: 10`、`needs_review`、検証方法・原文を追加しています。手動確認済み効果には原文ハッシュも保存しています。

`character_name`, `skill_name`, `skill_slot`, `target`, `target_type`, `buff_type`, `value`, `value_unit`, `duration`, `trigger`, `condition`, `stack_count`, `max_raw_value`, `source_url`, `notes`

さらに全effectで `source_type`（`nikke_gg` / `nikke_explorer` / `manual` / `official`）、`source_checked_at`（元ページ取得時のISO日時）、`source_conflict` を必須としています。手動で文を確認したこととソースの種類は別で、NIKKE.GG原文を確認した効果の `source_type` は `nikke_gg` です。各effectの詳細で参照元と確認日時を表示します。

キャラ基本情報は `nikke_gg_url` と `nikke_explorer_url` を別々に保持します。片方にしかいないキャラのもう一方のURLは `null` にし、存在を推測しません。両サイトの安定した `resource_id` / `id` を `nikke-<ID>` として関連付けます。名前の曖昧一致では統合しません。

`value_unit` は `percent`、`caster_atk_percent`、`caster_def_percent`、`caster_max_hp_percent`、`caster_charge_speed_percent`、`seconds`、`boolean`、`conversion`、`flat_value` を区別します。`atk`、`caster_atk_based_atk`、`attack_damage` は別カテゴリです。Stackは `value` が1スタック値、`stack_count` が最大数、`max_raw_value` がその積です。変換率から実効値は算出しません。一般の自動文法は明確な増加と被ダメージ軽減・CT短縮のみを抽出し、人間が分類した固有カテゴリは原文の増減方向をそのまま保持します。

`debuff_immunity` は個別カテゴリへ分割せず、`immune_effect` と `immunity_count` で「任意デバフ1回」「任意デバフ無制限」「スタン無効」等を区別します。boolean／回数系のためRaw Value順には混在させず、所持キャラ優先＋名前順で表示します。固有resourceと状態遷移は `non-buff-effects.json` に保持し、通常比較へは入れません。

## 収集・更新方法

1. `npm run collect` でNIKKE.GGがキャラクターページに使用する公開データを一括取得します。NIKKE.GGは `visible: 1` のみ採用し、非表示枠はレポートに残します。Explorerの公開キャラクター一覧とIDで和集合を取ります。認証情報・Cookieは使用しません。
2. Skill 1 / Skill 2 / Burstを独立して確認します。NIKKE.GGは10段階の `levels[9]` でプレースホルダーを置換。ページ有無だけで完了判定しません。スキル欠落・説明欠落・Lv.10値欠落の場合のみExplorerの明示的 `slot` と10段階パラメータの10番目を使用します。固定パラメータはそのままです。短縮されたGG配列は明示slotまたは過去のID対応で位置を確定し、位置が曖昧な場合は補完せず要確認にします。
3. 未対応の文型・条件分岐は原文をレビューキューへ保存。GGの原文が取得できていれば、抽出未対応でもExplorerに差し替えません。`npm run collect:audit` は全Explorer詳細を取得して両ソースを照合します。通常更新ではNIKKE.GGに欠損slotがある場合だけExplorer詳細を更新します。同時3件・各取得後150ms待機で負荷を抑えています。
4. `npm run collect:offline` は `work/nikke-gg-raw/` と `work/nikke-explorer-raw/` の保存済みキャッシュから再生成します。元の確認日時を維持し、再生成日時やファイル更新日時を確認日時として使いません。初回はオンライン取得が必要です。アプリ表示は生成済み `data/` だけで動作します。
5. メタデータは `character-overrides.json` のIDに出典付きで追加し再収集。新キャラはどちらかの一覧に現れればコード変更なしで追加されます。実装日を確認できない場合は `null` と `needs_review` を維持します。
6. 手動確認した効果は `curated-effects.json` に独立レコードを追加。置換する自動レコードがある場合は `replaces_effect_id` に指定します。一部効果を追加しただけで同キャラの他効果を削除しません。全効果を確認済みのスキルだけ、`reviewed-skills.json` に `character_id:source_type:source_skill_id` を追加します。`source_skill_text` とSHA-256の `source_skill_hash` を保存してください。
7. 再取得時、手動効果の原文が変われば旧値を保持して `needs_review: true` とし、数値比較から除外します。GGに後日スキルが追加されれば、その枠だけGGを採用し、二重計上せず `source-history.json` に移行前後を残します。入力の手動確認ファイルは消しません。
8. `npm test` と `npm run validate:data` → `npm run build` → ページ再読み込み。

### 安全なデータ更新パイプライン

- `npm run update-data -- --dry-run`：online取得、raw source差分、parse、全監査、候補dataset上での全test/build、Markdown/JSONレポートまで実施。canonical `data/` とcurrent source cacheは変更しません。
- `npm run update-data`：incremental source分類後、全quality gate通過時だけstaging cacheとJSONをcommitします。通常はNIKKE.GGを取得し、Explorerは欠損slotのみ補完します。
- `npm run update-data -- --full`：Explorer全slot照合を含むfull audit/rebuildです。
- `npm run update-data -- --dry-run --offline`：保存済みraw cacheだけで再現性を確認します。
- `npm run verify-data`：networkなしでschema、Unknown／positive audit、comparison境界、effect ID、全回帰test、production buildを検証します。

取得物は`work/update-run-*`へ隔離し、source取得失敗・suspicious deletion・schema/audit/test/build失敗ではcanonical datasetを置き換えません。更新前cacheはgeneration directoryとして保存し、pointerを先に切り替えた後にJSONを`.tmp`からcommitします。commit失敗時はcache pointerと部分置換済みJSONを元へ戻します。dry-runを含む人間向け結果は`outputs/update-reports/`へ出力します。

同じsource内容のeffect IDはparser実行順と無関係に検証します。`manual_override: true`は候補生成後にcanonical値へ戻し、actual overwriteを常に0にします。review decisionのsource hashが変わった場合は`stale_review_decision`として比較から隔離し、決定ファイル自体は消去・自動更新しません。`source_limitations`は正常状態として扱い、種類別の増減だけを更新レポートへ記録します。

## Review画面と確認結果の保存

比較画面上部の「Review」から開きます。9理由を複数付与し、未知のバフ種別→効果量→特殊挙動→対象を優先して確認できます。持続・発動・対象外候補は後方です。Missing ValueとParser Failureも独立した絞り込みです。理由別件数は重複し、合計は対象節数と一致しない場合があります。初期表示は未確認＋Hold、25件ずつのページ表示です。

`npm run review:serve` でローカル保存サービスとサイトを `http://127.0.0.1:4174/` に起動します。保存時はネットワークで再取得せず、確認日時付きキャッシュから再生成します。サーバー停止時や静的配布物単独では閲覧専用となり、保存ボタンを無効にします。ブラウザのlocalStorageを正本には使いません。

- Approve：提示されたバフ候補をそのまま承認。必須項目が不明ならEditまたはHold。
- Edit：バフごとにRaw Value・カテゴリ・単位・対象・持続・条件・stackを編集して承認。スタックの積以外の実効値は計算しません。
- Exclude：その節全体を比較対象外にする。原文と判断履歴は残ります。
- Hold：判断を保留し、比較に含めない。
- 一括除外：`not_a_buff_candidate` の未処理／保留／自動除外項目だけを複数選択できます。バフ候補も含まれる場合は警告し、原文確認のチェックを要求します。

人間の操作は必ず確認者名（自己申告）を入力します。`review_status`、`reviewed_at`、`reviewed_by`、`manual_override`、`review_note` と、承認時の原文・効果を保存します。Approve/Edit/Excludeは `manual_override: true` で自動上書き禁止。Holdも再取得で勝手に公開しません。原文が変わっても確認状態・承認した値・確認日時を維持し、別の `source_changed_since_review` アラートを表示します。人間が再度Editしたときだけ更新できます。確認者はアカウント認証ではないため、ローカル用途の信頼できる利用者向けです。

保存は同時更新ロックとrevision確認を使い、古い画面からの上書きを拒否します。全データを検証・ステージングしてから保存し、判断ファイルのrevisionは最後に更新します。公開処理の途中で失敗した場合は置き換え済みファイルを以前の状態に戻します。保存先は `data/review-decisions.json`、直前バックアップは `work/data-backups/` です。異常終了で `work/data-write.lock` が残った場合は、収集・保存プロセスが終了していることを確認した上で、そのロックファイルのみを取り除いて再実行してください。

保存サービスは127.0.0.1のみに待ち受け、Host・Originと書き込みトークンを検証します。共有サーバーへの公開用の認証機能はありません。このローカル保存サービスをそのままインターネットへ公開しないでください。

### 自動除外の範囲と実装日の分離

階層節は親全体を除外せず、子ごとにbuff / damage / debuff / heal / cost_or_penalty / specialを判定します。バフとコストの混在ではバフだけを比較へ追加し、対象外の子は `non-buff-effects.json` と親子ツリーに保持します。未解釈の子はReviewへ残し、確定済みの兄弟バフを巻き添えにしません。親の条件自体が不明な場合は、その条件に依存する子もReviewに残します。

キャラクターに `effect_review_status` / `effect_needs_review`、`release_date_review_status` / `release_date_needs_review`、その他の `metadata_review_status` を別々に保存します。互換用の集約 `needs_review` は残しますが、公開判定には使いません。実装日未確認でも既知の効果は通常どおり比較でき、不明日が末尾になるのは実装日ソートだけです。

### 競合と取得失敗

同じ枠の正規化した原文が一致すれば `equal`。文構造が同じで数値だけが異なる場合は、各位置の `nikke_gg_value` / `nikke_explorer_value` を記録します。文構造も違う場合は、双方の全文と数値列を保存し、異なる効果を推測でペアにしません。数値列も異なる場合は保守的に `source_conflict: true` とします。記述差・数値競合とも該当枠のeffectsを `needs_review` にし、GGの値を保持したまま比較から除外します。詳細の確認待ち欄で両原文を確認できます。

GG取得エラー・未知のメタデータ・データ検証失敗では生成済み比較データを置き換えません。Explorer取得失敗では前回キャッシュがあればその確認日時のまま使用し、なければ欠損として残します。いずれも `collection-report.json` の `warnings` に記録します。直前の生成ファイルは `work/data-backups/` にバックアップします。

## 階層パーサー

Skill Lv.10 text is stored and parsed as `Skill → Section/Trigger → optional named Mode/Status → child Effect`. `Effect 1/2/3` is a child index, not an independent section. Parent target, trigger and lifetime are inherited only when a child does not explicitly override them.

`npm test` runs the A2 Mode B regression first-class. `prepareCollection()` also runs that assertion before fetching or parsing the catalog; a regression prevents all generated-data writes. The generated artifacts include:

- `skill-hierarchies.json`: lossless section/group/child parse context, including Function text.
- `non-buff-effects.json`: costs, damage, healing and special child effects excluded from comparison.
- `unknown-buff-candidates.json`: normalized labels, occurrence counts, character/slot/source lines. 人間の分類表にない候補からbuff typeを自動追加しません。
- `unknown-reclassification-report.json`: 分類結果（新規・既存統合・resource・special・penalty/debuff）と残件。
- `parser-migration-report.json`: semantic retention and anything removed from the comparison during a parser migration.

Human review decisions remain in `review-decisions.json`. Approved or edited values use `manual_override: true` and are reapplied after every automatic parse; they are never silently replaced.

## UI / CSS変更時の注意

`tests/data/ui-qa-v4.2-data.test.mjs` と `tests/data/treasure-data.test.mjs` は、**CSSセレクタと宣言を文字列として直接検証**しています。見た目だけの変更でもテストが落ちるため、以下に触れる場合は必ず該当テストも同時に確認してください（`npm run test:data`。実データ未取得時はスキップされます）。

- `.comparison-list { overflow-x:auto ... }` — 狭幅で横スクロールする比較表の前提
- sticky identity column — `.comparison-columns>span:first-child,.character-identity` の `position:sticky; left:0`
- `.character-portrait` のサイズと構造 — 36px（480px以下で30px）、`img` の `object-fit:cover`、`index.html` 側の portrait → name の並び
- 390px前後のレスポンシブ制約 — `.comparison-columns,.character-row` の `min-width`（720px / 480px以下は680px）。狭幅で1カラムに畳む変更は明示的に禁止されています
- Treasure の avatar / border 関連 — `.formation-slot.has-treasure` は `border-color` のみで `outline` を使わず、選択枠との `outline-offset`（通常2px / 宝もの時4px）が重ならないこと

いずれも「レイアウトが壊れないこと」を守るための制約です。意図的に変えたい場合は、テスト側の期待値も併せて更新し、変更理由を明記してください。
