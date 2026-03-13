import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const db = new Database("linkhub.db");

// Initialize database
db.exec(`
  DROP TABLE IF EXISTS settings;
  
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
    id INTEGER PRIMARY KEY CHECK (id = 1),
    profile_name TEXT DEFAULT 'Dembel City Center',
    profile_username TEXT DEFAULT '@dembelcitycenter',
    profile_image TEXT DEFAULT 'https://picsum.photos/seed/mall/200/200',
    bg_color TEXT DEFAULT '#ffffff',
    button_color TEXT DEFAULT '#1e40af',
    text_color TEXT DEFAULT '#ffffff'
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  INSERT OR IGNORE INTO settings (id, profile_name, profile_username, profile_image, bg_color, button_color, text_color) VALUES (1, 'Dembel City Center', '@dembelcitycenter', 'https://picsum.photos/seed/mall/200/200', '#ffffff', '#1e40af', '#ffffff');
`);

const hash = bcrypt.hashSync("admin123", 10);
const adminExists = db
  .prepare("SELECT * FROM users WHERE username = 'admin'")
  .get();
if (!adminExists) {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(
    "admin",
    hash,
  );
}

const seedLinks = [
  {
    title: "Facebook",
    subtitle: "Follow us for updates",
    url: "https://facebook.com",
    icon: "web",
  },
  {
    title: "Instagram",
    subtitle: "Latest events & shops",
    url: "https://instagram.com",
    icon: "instagram",
  },
  {
    title: "Telegram",
    subtitle: "Join our channel",
    url: "https://t.me",
    icon: "telegram",
  },
  {
    title: "Website",
    subtitle: "Visit our official site",
    url: "https://example.com",
    icon: "web",
  },
];

const insertLink = db.prepare(
  "INSERT INTO links (title, subtitle, url, icon) VALUES (?, ?, ?, ?)",
);
seedLinks.forEach((l) => insertLink.run(l.title, l.subtitle, l.url, l.icon));

async function startServer() {
  const app = express();
  app.use(express.json());


  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  // API Routes

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token });
  });

  app.post("/api/register", auth, async (req, res) => {
    const { username, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(
      username,
      hash,
    );

    res.json({ success: true });
  });
  app.get("/api/links", (req, res) => {
    const links = db.prepare("SELECT * FROM links WHERE active = 1 ORDER BY sort_order ASC").all();
    res.json(links);
  });

  app.get("/api/admin/links", (req, res) => {
    const links = db
      .prepare("SELECT * FROM links ORDER BY sort_order ASC")
      .all();
    res.json(links);
  });

  app.post("/api/admin/links", auth, (req, res) => {
    const { title, subtitle, icon, url, sort_order } = req.body;
    const info = db
      .prepare(
        "INSERT INTO links (title, subtitle, icon, url, sort_order) VALUES (?, ?, ?, ?, ?)",
      )
      .run(title, subtitle, icon, url, sort_order || 0);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/admin/links/:id", auth, (req, res) => {
    const { id } = req.params;
    const { title, subtitle, icon, url, sort_order, active } = req.body;
    db.prepare(
      "UPDATE links SET title = ?, subtitle = ?, icon = ?, url = ?, sort_order = ?, active = ? WHERE id = ?",
    ).run(title, subtitle, icon, url, sort_order, active ? 1 : 0, id);
    res.json({ success: true });
  });

  app.delete("/api/admin/links/:id", auth, (req, res) => {
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
    const settings = db
      .prepare("SELECT * FROM settings WHERE id = 1")
      .get() as any;
    res.json(settings);
  });

  app.put("/api/settings", (req, res) => {
    const settings = req.body;
    db.prepare(
      `
      UPDATE settings SET 
        profile_name = ?, 
        profile_username = ?, 
        profile_image = ?, 
        bg_color = ?, 
        button_color = ?, 
        text_color = ?
      WHERE id = 1
    `,
    ).run(
      settings.profile_name,
      settings.profile_username,
      settings.profile_image,
      settings.bg_color,
      settings.button_color,
      settings.text_color,
    );
    res.json({ success: true });
  });

  app.get("/api/analytics", auth, (req, res) => {
    const stats = db
      .prepare(
        `
      SELECT l.title, COUNT(a.id) as clicks
      FROM links l
      LEFT JOIN analytics a ON l.id = a.link_id
      GROUP BY l.id
      ORDER BY clicks DESC
    `,
      )
      .all();
    res.json(stats);
  });

  function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({ error: "No token" });
    }

    const token = header.split(" ")[1];

    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  }


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
