# e-Stat + Friendship Grouping (React)

**Demo:** [https://maplestorykid.github.io/TESTREPO/](https://maplestorykid.github.io/TESTREPO/)

## 課題要件
1. e-Stat API (ver3.0) から首都圏の総人口データを取得し、都県（横軸）×西暦降順（縦軸）の表を表示
2. 友好度CSVから、都道府県を最大3グループに分けて「同一グループ内の友好度合計」を最大化
3. 2のグルーピング結果に従って、1の表をグループごとに色分け

## 使い方（ローカル実行）
Node.js / npm が必要です（この環境には未導入のため、手元環境で実行してください）。

```bash
npm install
npm run dev
```

## e-Stat の設定
アプリ内で `appId` / `statsDataId` を入力してライブ取得できます（レスポンス形式は統計表により異なり、パースは未調整の可能性があります）。
取得に失敗した場合は raw 応答を画面に表示します。


