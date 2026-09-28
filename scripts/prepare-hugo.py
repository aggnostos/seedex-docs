#!/usr/bin/env python3
"""Build Hugo content from the existing GitBook Markdown sources."""
import html
import json
import posixpath
import re
import shutil
import subprocess
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / '.hugo' / 'content'
DATA = ROOT / '.hugo' / 'data'
FENCE = re.compile(r"^( *)```(\w*)[ \t]*\n(.*?)^ *```[ \t]*$", re.M | re.S)
WORD = re.compile(r"""(?:'[^']*'|"[^"]*"|[^\s'"|;&])+""")


def shell_tokens(line):
    """Split a shell line like GitBook's Shiki bash grammar, including its quirks."""
    tokens, position, command = [], 0, True
    while position < len(line):
        rest = line[position:]
        space = re.match(r'[ \t]+', rest)
        if space:
            tokens.append(('', space.group()))
        elif rest[0] == '#' and (position == 0 or line[position - 1] in ' \t'):
            tokens.append(('c', rest))
            break
        elif re.match(r'\|\||&&|[|;&]', rest):
            operator = re.match(r'\|\||&&|[|;&]', rest).group()
            tokens.append(('o', operator))
            command = True
            position += len(operator)
            continue
        else:
            word = WORD.match(rest).group()
            assignment = re.fullmatch(r'([A-Za-z_]\w*)=(.*)', word)
            if command and assignment:
                tokens += [('', assignment.group(1)), ('o', '=')]
                if assignment.group(2):
                    tokens.append(('s', assignment.group(2)))
            elif command:
                tokens.append(('f', word))
                command = False
            elif re.fullmatch(r'<[^<>\s]{2,}>', word):
                tokens += [('o', '<'), ('s', word[1:-2]), ('', word[-2]), ('o', '>')]
            elif re.fullmatch(r'-{1,2}[A-Za-z][\w-]*|\d+', word):
                tokens.append(('k', word))
            else:
                tokens.append(('s', word))
            position += len(word)
            continue
        position += len(tokens[-1][1])
    return tokens


def highlight_shell(code):
    lines = []
    for line in code.split('\n'):
        spans = ''.join(f'<span class="sh-{kind}">{html.escape(text)}</span>' if kind else html.escape(text)
                        for kind, text in shell_tokens(line))
        lines.append(spans)
    return lines


def page_url(language, source):
    path = re.sub(r'(^|/)README\.md$', '', source)
    path = re.sub(r'\.md$', '', path).strip('/')
    return '/' + '/'.join(p for p in (language if language == 'ru' else '', path) if p) + ('/' if path or language == 'ru' else '')


def prepare():
    for directory in (OUTPUT, DATA):
        if directory.exists():
            shutil.rmtree(directory)
    count = 0
    highlighted = {}
    for language in ('en', 'ru'):
        source_dir = ROOT / language
        entries = re.findall(r'^\s*\* \[([^]]+)\]\(([^)]+)\)', (source_dir / 'SUMMARY.md').read_text(), re.M)
        for weight, (label, source) in enumerate(entries):
            src = source_dir / source
            body = src.read_text()
            heading = re.match(r'^# (.+)\n+', body)
            title = heading.group(1) if heading else label
            if heading:
                body = body[heading.end():]
            def link(match):
                destination = match.group(2)
                parts = urlsplit(destination)
                if parts.scheme or parts.netloc or destination.startswith(('#', '/')):
                    return match.group(0)
                resolved = posixpath.normpath(posixpath.join(posixpath.dirname(source), parts.path))
                if parts.path.endswith('.md'):
                    if not (source_dir / resolved).is_file():
                        raise ValueError(f'{src}: missing link {destination}')
                    target = page_url(language, resolved)
                elif resolved.startswith('../assets/'):
                    target = '/' + resolved.removeprefix('../')
                    if not (ROOT / resolved.removeprefix('../')).is_file():
                        raise ValueError(f'{src}: missing image {destination}')
                else:
                    return match.group(0)
                if parts.fragment:
                    target += '#' + parts.fragment
                return match.group(1) + target + ')'
            body = re.sub(r'(!?\[[^\]]*\]\()([^\s)]+)\)', link, body)
            body = re.sub(r'{% hint style="([^"]+)" %}', lambda m: '{{< callout type="' + m.group(1) + '" >}}', body)
            body = body.replace('{% endhint %}', '{{< /callout >}}')
            if '{%' in body.replace('{{%', ''):
                raise ValueError(f'{src}: unsupported GitBook directive')
            def fence(match):
                indent, lang, code = match.groups()
                if lang not in ('sh', 'bash', 'shell'):
                    return match.group(0)
                code = re.sub(r'^ {0,%d}' % len(indent), '', code.removesuffix('\n'), flags=re.M)
                key = f'{language}-{len(highlighted)}'
                highlighted[key] = highlight_shell(code)
                return f'{indent}```{lang} {{key="{key}"}}\n{match.group(3)}{indent}```'
            body = FENCE.sub(fence, body)
            metadata = {'title': title, 'linkTitle': label, 'weight': weight * 10, 'type': 'docs', 'breadcrumbs': False}
            updated = subprocess.run(['git', 'log', '-1', '--format=%cI', '--', str(src)], cwd=ROOT, capture_output=True, text=True).stdout.strip()
            if updated:
                metadata['lastmod'] = updated
            metadata['prev'] = page_url('en', entries[weight - 1][1]) if weight else False
            metadata['next'] = page_url('en', entries[weight + 1][1]) if weight + 1 < len(entries) else False
            if source == 'README.md':
                metadata.update(layout='docs', cascade={'type': 'docs', 'breadcrumbs': False})
            if language == 'en':
                metadata['aliases'] = ['/en' + page_url(language, source)]
            target = OUTPUT / language / source.replace('README.md', '_index.md')
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text('---\n' + '\n'.join(f'{k}: {json.dumps(v, ensure_ascii=False)}' for k,v in metadata.items()) + '\n---\n\n' + body)
            count += 1
    DATA.mkdir(parents=True)
    (DATA / 'highlight.json').write_text(json.dumps(highlighted, ensure_ascii=False))
    print(f'Prepared {count} pages for Hugo.')

if __name__ == '__main__':
    prepare()
