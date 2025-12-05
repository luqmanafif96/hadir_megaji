import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const ROOT = process.cwd();  
const DATA_DIR = path.join(ROOT, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ATTEND_FILE = path.join(DATA_DIR, "attendance.json");
const DIST_DIR = path.join(ROOT, "dist"); // <-- React build

// ensure data folder exists
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR);
if (!existsSync(USERS_FILE)) writeFileSync(USERS_FILE, "[]");
if (!existsSync(ATTEND_FILE)) writeFileSync(ATTEND_FILE, "[]");

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8") || "[]");
  } catch (e) {
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

function contentType(p) {
  if (p.endsWith(".html")) return "text/html";
  if (p.endsWith(".js")) return "application/javascript";
  if (p.endsWith(".css")) return "text/css";
  if (p.endsWith(".png")) return "image/png";
  if (p.endsWith(".svg")) return "image/svg+xml";
  return "text/plain";
}

Bun.serve({
  port: process.env.PORT || 3000,

  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // -------------------- CORS Preflight --------------------
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

    // -------------------- API: USERS ------------------------
    if (pathname.startsWith("/api/users")) {
      if (req.method === "GET") {
        return jsonResponse(readJson(USERS_FILE));
      }

      if (req.method === "POST") {
        const body = await req.json();
        const users = readJson(USERS_FILE);

        if (users.find(u => u.phone === body.phone)) {
          return jsonResponse({ error: "phone_exists" }, 400);
        }

        const user = {
          id: Date.now(),
          name: body.name,
          phone: body.phone
        };

        users.push(user);
        saveJson(USERS_FILE, users);

        return jsonResponse(user, 201);
      }

      if (req.method === "PUT") {
        const body = await req.json();
        let users = readJson(USERS_FILE);

        users = users.map(u =>
          u.id === body.id ? { ...u, name: body.name, phone: body.phone } : u
        );

        saveJson(USERS_FILE, users);

        return jsonResponse({ ok: true });
      }

      if (req.method === "DELETE") {
        const id = Number(url.searchParams.get("id"));
        let users = readJson(USERS_FILE);

        users = users.filter(u => u.id !== id);
        saveJson(USERS_FILE, users);

        return jsonResponse({ ok: true });
      }
    }

    // -------------------- API: ATTENDANCE ---------------------
    if (pathname.startsWith("/api/attendance")) {
      if (req.method === "GET") {
        return jsonResponse(readJson(ATTEND_FILE));
      }

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

        const attendance = readJson(ATTEND_FILE);
        attendance.push(entry);
        saveJson(ATTEND_FILE, attendance);

        return jsonResponse(entry, 201);
      }
    }

    // -------------------- STATIC: React Build --------------------
    let filePath = path.join(DIST_DIR, pathname);

    try {
      const file = Bun.file(
        pathname === "/" ? path.join(DIST_DIR, "index.html") : filePath
      );

      return new Response(file, {
        headers: { "Content-Type": contentType(filePath) }
      });
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  }
});

console.log("🚀 Bun server running on port", process.env.PORT || 3000);
