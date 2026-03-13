import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("linkhub.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    icon TEXT,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id INTEGER,
    clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (link_id) REFERENCES links(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('profile_name', 'AI Tech Hub');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('profile_username', '@ai_tech_8');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('profile_image', 'https://picsum.photos/seed/tech/200');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('bg_color', '#8FB7B7');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('button_color', '#FFFFFF');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('text_color', '#1A1A1A');
`);

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/links", (req, res) => {
    const links = db.prepare("SELECT * FROM links WHERE active = 1 ORDER BY sort_order ASC").all();
    res.json(links);
  });

  app.get("/api/admin/links", (req, res) => {
    const links = db.prepare("SELECT * FROM links ORDER BY sort_order ASC").all();
    res.json(links);
  });

  app.post("/api/admin/links", (req, res) => {
    const { title, subtitle, icon, url, sort_order } = req.body;
    const info = db.prepare(
      "INSERT INTO links (title, subtitle, icon, url, sort_order) VALUES (?, ?, ?, ?, ?)"
    ).run(title, subtitle, icon, url, sort_order || 0);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/admin/links/:id", (req, res) => {
    const { id } = req.params;
    const { title, subtitle, icon, url, sort_order, active } = req.body;
    db.prepare(
      "UPDATE links SET title = ?, subtitle = ?, icon = ?, url = ?, sort_order = ?, active = ? WHERE id = ?"
    ).run(title, subtitle, icon, url, sort_order, active ? 1 : 0, id);
    res.json({ success: true });
  });

  app.delete("/api/admin/links/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM links WHERE id = ?").run(id);
    db.prepare("DELETE FROM analytics WHERE link_id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/links/:id/click", (req, res) => {
    const { id } = req.params;
    db.prepare("INSERT INTO analytics (link_id) VALUES (?)").run(id);
    res.json({ success: true });
  });

  app.get("/api/settings", (req, res) => {
    const rows = db.prepare("SELECT * FROM settings").all();
    const settings = rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    res.json(settings);
  });

  app.put("/api/settings", (req, res) => {
    const settings = req.body;
    const updateStmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        updateStmt.run(key, String(value));
      }
    });
    transaction(settings);
    res.json({ success: true });
  });

  app.get("/api/analytics", (req, res) => {
    const stats = db.prepare(`
      SELECT l.title, COUNT(a.id) as clicks
      FROM links l
      LEFT JOIN analytics a ON l.id = a.link_id
      GROUP BY l.id
      ORDER BY clicks DESC
    `).all();
    res.json(stats);
  });



  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
