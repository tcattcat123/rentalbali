#!/usr/bin/env python3
"""RentHome Bali — local admin server.

Serves the static site AND persists cabinet listings to files
(no database needed):
  - data/user-listings.json  — objects created in the cabinet
  - img/listings/            — uploaded photos

Run:  python admin-server.py   (or: python admin-server.py 8080)
Then open http://localhost:8000 and use the Profile tab.
Commit data/user-listings.json + img/listings/ to git and push —
Vercel will serve them as static files.
"""
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(ROOT, "data", "user-listings.json")
IMG_DIR = os.path.join(ROOT, "img", "listings")
ALLOWED_EXT = {".jpg": "image/jpeg", ".jpeg": "image/jpeg",
               ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif"}
MAX_IMG_BYTES = 8 * 1024 * 1024


def tg_embed_url(url):
    m = re.match(r"https?://t\.me/([A-Za-z0-9_]+)/(\d+)", url or "")
    if not m:
        return None
    return "https://t.me/%s/%s?embed=1" % (m.group(1), m.group(2))


def tg_clean_text(html):
    m = (re.search(r'js-message_text"[^>]*>([\s\S]*?)</div>\s*</div>', html)
         or re.search(r'js-message_text"[^>]*>([\s\S]*?)</div>', html))
    if not m:
        return ""
    t = m.group(1)
    t = re.sub(r"<br\s*/?>", "\n", t, flags=re.I)
    t = re.sub(r"</(p|div)>", "\n", t, flags=re.I)
    t = re.sub(r"<[^>]+>", "", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    for a, b in (("&quot;", '"'), ("&#39;", "'"), ("&lt;", "<"),
                 ("&gt;", ">"), ("&amp;", "&")):
        t = t.replace(a, b)
    return t.strip()


def tg_photos(html):
    out = []
    for u in re.findall(r"https://cdn\d?\.telesco\.pe/file/[^\"'()\s]+", html):
        if u not in out:
            out.append(u)
    return out[:8]


def drive_folder_id(url):
    m = re.search(r"/drive/folders/([A-Za-z0-9_-]+)", url or "")
    return m.group(1) if m else None


ENTRY_RE = re.compile(
    r'<a href="([^"]+)"[^>]*>.*?flip-entry-title">([^<]+)</div>', re.S)


def drive_fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=25) as resp:
        return resp.read(3 * 1024 * 1024).decode("utf-8", errors="replace")


def drive_list(folder_id):
    html = drive_fetch(
        "https://drive.google.com/embeddedfolderview?id=" + folder_id)
    title_m = re.search(r"<title>([^<]+)</title>", html)
    entries = []
    for href, name in ENTRY_RE.findall(html):
        name = name.strip()
        if "/drive/folders/" in href:
            mm = re.search(r"/drive/folders/([A-Za-z0-9_-]+)", href)
            if mm:
                entries.append({"kind": "folder", "id": mm.group(1),
                                "title": name})
        elif "/file/d/" in href:
            mm = re.search(r"/file/d/([A-Za-z0-9_-]+)", href)
            if mm:
                entries.append({"kind": "file", "id": mm.group(1),
                                "title": name})
        elif "docs.google.com/document/d/" in href:
            mm = re.search(r"/document/d/([A-Za-z0-9_-]+)", href)
            if mm:
                entries.append({"kind": "doc", "id": mm.group(1),
                                "title": name})
    return (title_m.group(1).strip() if title_m else ""), entries


def drive_doc_text(doc_id):
    try:
        return drive_fetch(
            "https://docs.google.com/document/d/%s/export?format=txt"
            % doc_id)
    except Exception:
        return ""


IMG_RE = re.compile(r"\.(jpe?g|png|webp|gif)$", re.I)


def read_user_items():
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except (OSError, ValueError):
        return []


def write_user_items(items):
    if not isinstance(items, list):
        raise ValueError("items must be a list")
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    tmp = DATA_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    os.replace(tmp, DATA_FILE)
    return len(items)


def parse_multipart(body, boundary):
    """Minimal multipart parser. Returns list of (fieldname, filename, content_type, data)."""
    parts = []
    sep = ("--" + boundary).encode("latin-1")
    chunks = body.split(sep)
    for chunk in chunks[1:]:
        if chunk.strip(b"\r\n-") == b"":
            continue
        if b"\r\n\r\n" not in chunk:
            continue
        head, data = chunk.split(b"\r\n\r\n", 1)
        if data.endswith(b"\r\n"):
            data = data[:-2]
        if data.endswith(b"--"):
            data = data[:-2]
        try:
            head_s = head.decode("latin-1")
        except ValueError:
            continue
        name_m = re.search(r'name="([^"]+)"', head_s)
        file_m = re.search(r'filename="([^"]*)"', head_s)
        type_m = re.search(r'Content-Type:\s*([^\r\n;]+)', head_s, re.I)
        parts.append((
            name_m.group(1) if name_m else "",
            file_m.group(1) if file_m else "",
            (type_m.group(1).strip() if type_m else "application/octet-stream"),
            data,
        ))
    return parts


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, *args):
        pass

    def _send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/ping":
            return self._send_json({"ok": True, "mode": "file"})
        if path == "/api/listings":
            return self._send_json({"ok": True, "items": read_user_items()})
        if path == "/api/tg":
            qs = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            url = (qs.get("url") or [""])[0]
            emb = tg_embed_url(url)
            if not emb:
                return self._send_json(
                    {"ok": False, "error": "need t.me/channel/id link"}, 400)
            try:
                req = urllib.request.Request(
                    emb, headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=25) as resp:
                    html = resp.read(2 * 1024 * 1024).decode("utf-8",
                                                             errors="replace")
            except Exception as e:
                return self._send_json(
                    {"ok": False, "error": "fetch failed: %s" % e}, 502)
            return self._send_json({"ok": True, "text": tg_clean_text(html),
                                    "photos": tg_photos(html)})
        if path == "/api/drive":
            qs = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            url = (qs.get("url") or [""])[0]
            fid = drive_folder_id(url)
            if not fid:
                return self._send_json(
                    {"ok": False,
                     "error": "need drive folders link"}, 400)
            try:
                title, entries = drive_list(fid)
            except Exception as e:
                return self._send_json(
                    {"ok": False,
                     "error": "folder fetch failed: %s" % e}, 502)
            doc = next((e for e in entries
                        if e["kind"] == "doc" and re.search(
                            r"descript|deskripsi|описание", e["title"], re.I)),
                       next((e for e in entries if e["kind"] == "doc"), None))
            foto = next((e for e in entries
                         if e["kind"] == "folder" and re.search(
                             r"foto|photo|image", e["title"], re.I)), None)
            photo_ids = [e["id"] for e in entries
                         if e["kind"] == "file" and IMG_RE.search(e["title"])]
            if foto:
                try:
                    _, sub = drive_list(foto["id"])
                    photo_ids += [e["id"] for e in sub
                                  if e["kind"] == "file"
                                  and IMG_RE.search(e["title"])]
                except Exception:
                    pass
            seen = list(dict.fromkeys(photo_ids))[:12]
            text = drive_doc_text(doc["id"]) if doc else ""
            return self._send_json({
                "ok": True, "folderTitle": title, "text": text,
                "docTitle": doc["title"] if doc else "",
                "photoIds": seen,
                "files": [e["title"] for e in entries],
            })
        return super().do_GET()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        length = int(self.headers.get("Content-Length") or 0)
        ctype = self.headers.get("Content-Type") or ""
        if path == "/api/listings":
            try:
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                n = write_user_items(payload.get("items", []))
                return self._send_json({"ok": True, "count": n})
            except (ValueError, OSError) as e:
                return self._send_json({"ok": False, "error": str(e)}, 400)
        if path == "/api/upload":
            m = re.search(r"multipart/form-data;\s*boundary=(.+)$", ctype)
            if not m:
                return self._send_json({"ok": False, "error": "multipart expected"}, 400)
            try:
                parts = parse_multipart(self.rfile.read(length), m.group(1).strip('"'))
            except OSError as e:
                return self._send_json({"ok": False, "error": str(e)}, 400)
            saved = []
            os.makedirs(IMG_DIR, exist_ok=True)
            for _, filename, _, data in parts:
                if not filename or not data:
                    continue
                if len(data) > MAX_IMG_BYTES:
                    continue
                ext = os.path.splitext(filename)[1].lower()
                if ext not in ALLOWED_EXT:
                    ext = ".jpg"
                name = "%s-%d%s" % (time.strftime("%Y%m%d-%H%M%S"),
                                    os.getpid() % 100000 + len(saved), ext)
                with open(os.path.join(IMG_DIR, name), "wb") as f:
                    f.write(data)
                saved.append("img/listings/" + name)
            if not saved:
                return self._send_json({"ok": False, "error": "no image received"}, 400)
            return self._send_json({"ok": True, "paths": saved})
        return self._send_json({"ok": False, "error": "not found"}, 404)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = ThreadingHTTPServer(("127.0.0.1", port),
                                 partial(Handler))
    print("RentHome admin: http://localhost:%d  (storage: data/user-listings.json + img/listings/)" % port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
