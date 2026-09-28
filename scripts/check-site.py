#!/usr/bin/env python3
"""Validate local links, images and anchors in the generated documentation."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import sys

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / 'public'

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.links, self.ids = [], set()
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        for attr in ('href', 'src'):
            if attr in attrs:
                self.links.append(attrs[attr])

pages = {path: Page(path) for path in ROOT.rglob('*.html')}
errors = []
for path, page in pages.items():
    for link in page.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        dest = unquote(url.path)
        target = (ROOT / dest.lstrip('/')) if dest.startswith('/') else path.parent / dest
        if not dest:
            target = path
        elif target.is_dir():
            target /= 'index.html'
        target = target.resolve()
        if not target.is_file():
            errors.append(f'{path.relative_to(ROOT)}: missing {link}')
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{path.relative_to(ROOT)}: missing anchor {link}')
for language in ('en', 'ru'):
    index = ROOT / f'{language}.search-data.json'
    if not index.exists() or not json.loads(index.read_text()):
        errors.append(f'Missing or empty {language} search index')
if errors:
    raise SystemExit('\n'.join(sorted(set(errors))))
print(f'Checked links and anchors in {len(pages)} HTML files; both search indexes exist.')
