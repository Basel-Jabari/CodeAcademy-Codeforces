#!/usr/bin/env python3
import re
import ssl
import urllib.request
from pathlib import Path

ctx = ssl.create_default_context()
html = urllib.request.urlopen("https://ppu.edu/", context=ctx, timeout=30).read().decode(
    "utf-8", "ignore"
)

urls = set(
    re.findall(
        r"""(?:src|href)=["']([^"']+\.(?:png|svg|jpg|jpeg|webp|ico))["']""",
        html,
        re.I,
    )
)
urls |= set(
    re.findall(
        r"""url\(["']?([^)"']+\.(?:png|svg|jpg|jpeg|webp))["']?\)""",
        html,
        re.I,
    )
)

print("FOUND_URLS")
for u in sorted(urls):
    print(u)

print("LOGO_SNIPPETS")
for m in re.findall(r".{0,40}logo.{0,100}", html, re.I)[:40]:
    print(re.sub(r"\s+", " ", m)[:160])

# Prefer likely logo assets
candidates = []
for u in urls:
    low = u.lower()
    if "logo" in low or "ppu" in low or "brand" in low:
        candidates.append(u)

# Also try common WordPress/theme paths
extra = [
    "https://ppu.edu/wp-content/uploads/2021/09/cropped-ppu-logo.png",
    "https://ppu.edu/wp-content/uploads/ppu-logo.png",
    "https://ppu.edu/wp-content/themes/ppu/assets/images/logo.png",
    "https://www.ppu.edu/sites/default/files/ppu_logo.png",
]
for u in extra:
    candidates.append(u)

out = Path(__file__).resolve().parents[1] / "src" / "assets" / "ppu_logo.png"
out.parent.mkdir(parents=True, exist_ok=True)

def absolutize(u: str) -> str:
    if u.startswith("//"):
        return "https:" + u
    if u.startswith("/"):
        return "https://ppu.edu" + u
    if not u.startswith("http"):
        return "https://ppu.edu/" + u.lstrip("./")
    return u

downloaded = False
tried = []
for u in candidates + sorted(urls):
    url = absolutize(u)
    if url in tried:
        continue
    tried.append(url)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        data = urllib.request.urlopen(req, context=ctx, timeout=20).read()
        if len(data) < 200:
            continue
        # skip svg for now unless nothing else works; prefer raster
        if url.lower().endswith(".svg") and any(
            t.lower().endswith((".png", ".jpg", ".jpeg", ".webp")) for t in candidates
        ):
            continue
        out.write_bytes(data)
        print("DOWNLOADED", url, "bytes", len(data), "->", out)
        downloaded = True
        break
    except Exception as e:
        print("FAIL", url, type(e).__name__, e)

if not downloaded:
    # fallback: try wikipedia / commons style public logo if site blocks
    fallbacks = [
        "https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/Palestine_Polytechnic_University_logo.png/220px-Palestine_Polytechnic_University_logo.png",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Palestine_Polytechnic_University_logo.png/320px-Palestine_Polytechnic_University_logo.png",
    ]
    for url in fallbacks:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            data = urllib.request.urlopen(req, context=ctx, timeout=20).read()
            out.write_bytes(data)
            print("DOWNLOADED_FALLBACK", url, "bytes", len(data), "->", out)
            downloaded = True
            break
        except Exception as e:
            print("FAIL_FALLBACK", url, type(e).__name__, e)

if not downloaded:
    raise SystemExit("Could not download PPU logo")
