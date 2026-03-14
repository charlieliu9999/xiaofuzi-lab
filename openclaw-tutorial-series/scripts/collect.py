#!/usr/bin/env python3
import json
import re
import urllib.request
from datetime import datetime, timezone
from xml.etree import ElementTree as ET


def fetch_json(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_text(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def parse_youtube_rss(xml_text, limit=10):
    ns = {"atom": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}
    root = ET.fromstring(xml_text)
    items = []
    for entry in root.findall("atom:entry", ns)[:limit]:
        title = (entry.findtext("atom:title", default="", namespaces=ns) or "").strip()
        link_el = entry.find("atom:link", ns)
        link = link_el.attrib.get("href") if link_el is not None else ""
        published = entry.findtext("atom:published", default="", namespaces=ns)
        author = entry.find("atom:author/atom:name", ns)
        items.append({
            "title": title,
            "link": link,
            "published": published,
            "author": author.text if author is not None else "",
        })
    return items


def extract_docs_urls(text, limit=20):
    urls = sorted(set(re.findall(r"https://docs\\.openclaw\\.ai[^\"'\\s)]+", text)))
    return urls[:limit]


def main():
    now = datetime.now(timezone.utc).isoformat()
    ua = {"User-Agent": "openclaw-tutorial-bot/0.1"}

    data = {"generated_at_utc": now}

    try:
        repo = fetch_json("https://api.github.com/repos/openclaw/openclaw", headers=ua)
        releases = fetch_json("https://api.github.com/repos/openclaw/openclaw/releases?per_page=5", headers=ua)
        data["github"] = {
            "repo": {
                "full_name": repo.get("full_name"),
                "description": repo.get("description"),
                "stars": repo.get("stargazers_count"),
                "forks": repo.get("forks_count"),
                "open_issues": repo.get("open_issues_count"),
                "html_url": repo.get("html_url"),
                "updated_at": repo.get("updated_at"),
            },
            "releases": [
                {
                    "name": r.get("name") or r.get("tag_name"),
                    "tag": r.get("tag_name"),
                    "published_at": r.get("published_at"),
                    "url": r.get("html_url"),
                }
                for r in releases
            ],
        }
    except Exception as e:
        data["github_error"] = str(e)

    try:
        docs_home = fetch_text("https://docs.openclaw.ai", headers=ua)
        data["docs"] = {
            "home": "https://docs.openclaw.ai",
            "links": extract_docs_urls(docs_home),
        }
    except Exception as e:
        data["docs_error"] = str(e)

    try:
        rss = fetch_text("https://www.youtube.com/feeds/videos.xml?search_query=openclaw", headers=ua)
        data["videos"] = parse_youtube_rss(rss, limit=12)
    except Exception as e:
        data["videos_error"] = str(e)

    with open("data/sources.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("wrote data/sources.json")


if __name__ == "__main__":
    main()
