# Notes — Expo React Native client

React Native 練習：一個 notes app，食 `node-notes-api` 條 live API
（Express + Postgres，`https://node-notes-api-3p1r.onrender.com`）。

## 功能

- 開 app 自動 `GET /api/hello` + `GET /api/notes`（list）
- 新增：`POST /api/notes`
- 刪除：`DELETE /api/notes/:id`（有 confirm dialog）
- 下拉 refresh（`FlatList` `onRefresh`）

## 點跑（Mac）

1. iPhone 裝 **Expo Go**（App Store，免費）
2. `cd mobile && npx expo start`
3. 用 Expo Go scan 個 QR code（部機同 Mac 要同一個 Wi-Fi）
4. 第一次開可能要等一陣——Render 免費版 cold start，API 瞓緊要 1 分鐘左右先醒

唔使 Xcode，唔使 Android Studio。改完 `App.js` save 即熱更新（Fast Refresh）。

## 學咩

- `useState` / `useEffect` / `useCallback`（同 web React 一樣）
- `fetch` 打 REST API（`GET` / `POST` / `DELETE`）
- RN components：`View`、`Text`、`TextInput`、`FlatList`、`TouchableOpacity`、`Alert`
- `StyleSheet`（CSS-in-JS，flexbox 為主）

## 下一步諗法

- API 加 `PUT /api/notes/:id`，app 加 edit 功能
- 轉 TypeScript（`npx expo install typescript`，再加 `tsconfig.json`）
