#!/usr/bin/env python3
"""
سكريبت جمع القوانين المصرية لتدريب موديل دليل (Dalil) - نسخة 2
==================================================================
يجمع من مصدرين: ويكي مصدر (ar.wikisource.org) و Masaar (masaar.net)
ويحفظ كل قانون في ملف JSON منفصل، مقسّم مادة مادة.

الاستخدام:
    pip install requests beautifulsoup4 lxml --break-system-packages
    python scrape_egyptian_laws_v2.py

المخرجات (جوه فولدر laws_data بجانب السكريبت):
    laws_data/<اسم_القانون>.json
    laws_data/_index.json
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import time
import os
from urllib.parse import unquote, urljoin

OUTPUT_DIR = "laws_data"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
}
REQUEST_DELAY = 1.5

# ---------------------------------------------------------------------------
# المصدر الأول: ويكي مصدر
# ---------------------------------------------------------------------------
WIKISOURCE_TARGETS = [
    ("دستور_مصر_2014", "https://ar.wikisource.org/wiki/دستور_مصر_2014"),
    ("قانون_العمل_14_لسنة_2025", "https://ar.wikisource.org/wiki/قانون_العمل_14_لسنة_2025_-_مصر"),
    ("قانون_العقوبات_المصري_ويكي", "https://ar.wikisource.org/wiki/قانون_العقوبات_المصري"),
]
WIKISOURCE_CATEGORY_URL = "https://ar.wikisource.org/wiki/تصنيف:قوانين_مصر"
WIKISOURCE_BASE = "https://ar.wikisource.org"

# ---------------------------------------------------------------------------
# المصدر الثاني: Masaar - أضف أي رابط قانون تاني من masaar.net/ar/egypt_laws/
# ---------------------------------------------------------------------------
MASAAR_TARGETS = [
    ("قانون_العقوبات_Masaar", "https://masaar.net/ar/egypt_laws/قانون-العقوبات/"),
]


def safe_filename(name: str) -> str:
    """يشيل أي حروف ممنوعة في أسماء الملفات على ويندوز (/ \\ : * ? " < > |)"""
    return re.sub(r'[\\/:*?"<>|]', "_", name)


def clean_text(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_into_articles(full_text: str) -> tuple[str, list[dict]]:
    """يقسم أي نص قانون لمواد بناءً على كلمة 'مادة'"""
    article_pattern = re.compile(r"(مادة\s*\(?[\d\u0660-\u0669]+\)?\s*مكرر?ا?ً?)", re.UNICODE)
    parts = article_pattern.split(full_text)

    articles = []
    if len(parts) > 2:
        preamble = parts[0].strip()
        i = 1
        while i < len(parts) - 1:
            marker = parts[i].strip()
            body = parts[i + 1].strip()
            if body:
                articles.append({"article": marker, "text": clean_text(body)})
            i += 2
    else:
        preamble = full_text
    return preamble[:2000], articles


def discover_law_links_from_category(session: requests.Session) -> list[tuple[str, str]]:
    print("[*] بجيب قائمة القوانين من صفحة التصنيف في ويكي مصدر...")
    try:
        resp = session.get(WIKISOURCE_CATEGORY_URL, headers=HEADERS, timeout=20)
        resp.raise_for_status()
    except Exception as e:
        print(f"[!] فشل فتح صفحة التصنيف: {e}")
        return []

    soup = BeautifulSoup(resp.text, "lxml")
    content_div = soup.find("div", id="mw-pages")
    if not content_div:
        return []

    links = []
    for a in content_div.find_all("a", href=True):
        href = a["href"]
        if href.startswith("/wiki/") and ":" not in href.split("/wiki/")[1]:
            full_url = urljoin(WIKISOURCE_BASE, href)
            name = unquote(href.split("/wiki/")[1]).replace(" ", "_")
            links.append((name, full_url))
    print(f"[+] لقيت {len(links)} قانون في صفحة التصنيف")
    return links


def scrape_wikisource_page(session: requests.Session, name: str, url: str) -> dict | None:
    try:
        resp = session.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
    except Exception as e:
        print(f"    [!] فشل تحميل {name}: {e}")
        return None

    soup = BeautifulSoup(resp.text, "lxml")
    content = soup.find("div", class_="mw-parser-output")
    if not content:
        return None

    for tag in content.find_all(["table", "sup", "span"], class_=re.compile(r"nav|edit|reference")):
        tag.decompose()

    full_text = clean_text(content.get_text("\n"))
    preamble, articles = split_into_articles(full_text)

    return {
        "law_name": name.replace("_", " "),
        "source_url": url,
        "source": "ar.wikisource.org",
        "preamble": preamble,
        "articles": articles,
        "articles_count": len(articles),
        "raw_text_length": len(full_text),
        "raw_text": full_text,
    }


def scrape_masaar_page(session: requests.Session, name: str, url: str) -> dict | None:
    try:
        resp = session.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
    except Exception as e:
        print(f"    [!] فشل تحميل {name}: {e}")
        return None

    soup = BeautifulSoup(resp.text, "lxml")
    # المحتوى الرئيسي في Masaar عادة جوه main أو article
    content = soup.find("article") or soup.find("main") or soup.find("div", class_=re.compile("content|entry"))
    if not content:
        print(f"    [!] مش لاقي محتوى في {name}")
        return None

    full_text = clean_text(content.get_text("\n"))
    preamble, articles = split_into_articles(full_text)

    return {
        "law_name": name.replace("_", " "),
        "source_url": url,
        "source": "masaar.net",
        "preamble": preamble,
        "articles": articles,
        "articles_count": len(articles),
        "raw_text_length": len(full_text),
        "raw_text": full_text,
    }


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    session = requests.Session()

    index = []

    # --- ويكي مصدر ---
    all_wikisource = dict(WIKISOURCE_TARGETS)
    discovered = discover_law_links_from_category(session)
    for name, url in discovered:
        if name not in all_wikisource:
            all_wikisource[name] = url

    print(f"\n[*] هيتم جمع {len(all_wikisource)} قانون من ويكي مصدر\n")
    for i, (name, url) in enumerate(all_wikisource.items(), 1):
        print(f"[ويكي مصدر {i}/{len(all_wikisource)}] بجيب: {name}")
        try:
            data = scrape_wikisource_page(session, name, url)
            if data:
                safe_name = safe_filename(name)
                out_path = os.path.join(OUTPUT_DIR, f"{safe_name}.json")
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"    [+] اتحفظ: {out_path} ({data['articles_count']} مادة)")
                index.append({"law_name": data["law_name"], "file": f"{safe_name}.json",
                              "articles_count": data["articles_count"], "source": data["source"]})
        except Exception as e:
            print(f"    [!] خطأ غير متوقع في {name}: {e}")
        time.sleep(REQUEST_DELAY)

    # --- Masaar ---
    print(f"\n[*] هيتم جمع {len(MASAAR_TARGETS)} قانون من Masaar\n")
    for i, (name, url) in enumerate(MASAAR_TARGETS, 1):
        print(f"[Masaar {i}/{len(MASAAR_TARGETS)}] بجيب: {name}")
        try:
            data = scrape_masaar_page(session, name, url)
            if data:
                safe_name = safe_filename(name)
                out_path = os.path.join(OUTPUT_DIR, f"{safe_name}.json")
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"    [+] اتحفظ: {out_path} ({data['articles_count']} مادة)")
                index.append({"law_name": data["law_name"], "file": f"{safe_name}.json",
                              "articles_count": data["articles_count"], "source": data["source"]})
        except Exception as e:
            print(f"    [!] خطأ غير متوقع في {name}: {e}")
        time.sleep(REQUEST_DELAY)

    index_path = os.path.join(OUTPUT_DIR, "_index.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    total_articles = sum(x["articles_count"] for x in index)
    print(f"\n[✓] خلصنا. {len(index)} قانون، إجمالي {total_articles} مادة")
    print(f"[✓] ملف الفهرس: {index_path}")


if __name__ == "__main__":
    main()
