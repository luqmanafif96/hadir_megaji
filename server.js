import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const ROOT = process.cwd();
// const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const DATA_DIR = process.env.DATA_DIR || "/var/data";
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ATTEND_FILE = path.join(DATA_DIR, "attendance.json");
const DIST_DIR = path.join(ROOT, "dist");

// Pastikan data folder wujud
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR);
if (!existsSync(USERS_FILE)) writeFileSync(USERS_FILE, "[]");
if (!existsSync(ATTEND_FILE)) writeFileSync(ATTEND_FILE, "[]");

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8") || "[]");
  } catch {
    return [];
  }
}

function saveJson(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2));
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html";
  if (filePath.endsWith(".js")) return "application/javascript";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  return "text/plain";
}

// Bun server
Bun.serve({
  port: Number(process.env.PORT) || 4000,
  hostname: "0.0.0.0",

  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // ---------------- OPTIONS / CORS ----------------
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // ---------------- API USERS ----------------
    if (pathname.startsWith("/api/users")) {
      const users = readJson(USERS_FILE);

      if (req.method === "GET") return jsonResponse(users);

      const body = await req.json();

      if (req.method === "POST") {
        if (users.find(u => u.phone === body.phone))
          return jsonResponse({ error: "phone_exists" }, 400);

        const user = { id: Date.now(), name: body.name, phone: body.phone };
        users.push(user);
        saveJson(USERS_FILE, users);
        return jsonResponse(user, 201);
      }

      if (req.method === "PUT") {
        const updatedUsers = users.map(u =>
          u.id === body.id ? { ...u, name: body.name, phone: body.phone } : u
        );
        saveJson(USERS_FILE, updatedUsers);
        return jsonResponse({ ok: true });
      }

      if (req.method === "DELETE") {
        const id = Number(url.searchParams.get("id"));
        const filteredUsers = users.filter(u => u.id !== id);
        saveJson(USERS_FILE, filteredUsers);
        return jsonResponse({ ok: true });
      }
    }

    // ---------------- API ATTENDANCE ----------------
    if (pathname.startsWith("/api/attendance")) {
      const attendance = readJson(ATTEND_FILE);

      if (req.method === "GET") return jsonResponse(attendance);

      if (req.method === "POST") {
        const body = await req.json();
        const users = readJson(USERS_FILE);
        const user = users.find(u => u.phone === body.phone);

        if (!user) return jsonResponse({ error: "not_found" }, 404);

        const now = new Date();
        const entry = {
          id: Date.now(),
          userId: user.id,
          name: user.name,
          phone: user.phone,
          day: now.toLocaleDateString("en-US", { weekday: "long" }),
          date: now.toISOString().slice(0, 10),
          time: now.toTimeString().slice(0, 8)
        };

        attendance.push(entry);
        saveJson(ATTEND_FILE, attendance);
        return jsonResponse(entry, 201);
      }
    }

    // ---------------- STATIC FILES / REACT ----------------
    let filePath = pathname === "/" ? path.join(DIST_DIR, "index.html") : path.join(DIST_DIR, pathname);

    // fallback ke index.html kalau file tak wujud (React Router)
    if (!existsSync(filePath)) filePath = path.join(DIST_DIR, "index.html");

    const file = Bun.file(filePath);
    return new Response(file, { headers: { "Content-Type": contentType(filePath) } });
  }
});

console.log("🚀 Bun server running on port", process.env.PORT || 4000);
