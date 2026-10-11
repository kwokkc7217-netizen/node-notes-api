// node-notes-api — Express + Postgres 練習
// 對應 Hutchison 技能：JavaScript、REST API design、SQL
// 同之前個 Java 版 /api/hello 係同一個 API，兩種語言實現（見工可以講）

const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json()); // 讀 POST 嘅 JSON body

const PORT = process.env.PORT || 3000;

// 有 DATABASE_URL 先連 DB；冇就 notes 功能停用，但 hello 照行
// Render 嗰邊會喺 Environment 加 DATABASE_URL（Neon 俾嘅 connection string）
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Neon 要 SSL；免費 DB 唔驗證 CA
    })
  : null;

if (pool) {
  // 起機嗰陣確保張枱存在（唔存在先 create，唔會洗走舊資料）
  pool
    .query(
      `CREATE TABLE IF NOT EXISTS notes (
         id SERIAL PRIMARY KEY,
         text VARCHAR(500) NOT NULL,
         created_at TIMESTAMPTZ DEFAULT NOW()
       )`
    )
    .then(() => console.log("[db] notes table ready"))
    .catch((e) => console.error("[db] init failed:", e.message));
} else {
  console.log("[db] no DATABASE_URL — /api/notes disabled, /api/hello still works");
}

// ---- 同 Java 版一樣嘅 hello（對照學習）----
app.get("/api/hello", (req, res) => {
  const name = req.query.name || "World";
  res.json({ message: `Hello, ${name}! [node]` });
});

// ---- notes CRUD（要 DB）----
function needDb(res) {
  if (!pool) {
    res.status(503).json({ error: "database not configured (set DATABASE_URL)" });
    return true;
  }
  return false;
}

// 讀晒所有 notes
app.get("/api/notes", async (req, res) => {
  if (needDb(res)) return;
  const { rows } = await pool.query("SELECT * FROM notes ORDER BY id DESC");
  res.json(rows);
});

// 讀一條
app.get("/api/notes/:id", async (req, res) => {
  if (needDb(res)) return;
  const { rows } = await pool.query("SELECT * FROM notes WHERE id = $1", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});

// 新增一條
app.post("/api/notes", async (req, res) => {
  if (needDb(res)) return;
  const text = (req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "text is required" });
  // $1 係 parameterized query，防 SQL injection（見工可以講）
  const { rows } = await pool.query(
    "INSERT INTO notes (text) VALUES ($1) RETURNING *",
    [text]
  );
  res.status(201).json(rows[0]);
});

// 刪除一條
app.delete("/api/notes/:id", async (req, res) => {
  if (needDb(res)) return;
  const { rowCount } = await pool.query("DELETE FROM notes WHERE id = $1", [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: "not found" });
  res.json({ deleted: Number(req.params.id) });
});

app.listen(PORT, () => console.log(`[node-notes-api] listening on :${PORT}`));
