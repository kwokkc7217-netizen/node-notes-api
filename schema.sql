-- 俾人睇嘅 schema（server.js 起機嗰陣會自動 CREATE TABLE IF NOT EXISTS，
--  所以呢個檔唔使手動跑，純教學用）
CREATE TABLE notes (
  id         SERIAL PRIMARY KEY,
  text       VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
