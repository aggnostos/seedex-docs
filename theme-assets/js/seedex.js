// Behaviour of the Seedex documentation theme: theme switch, menus, sheets, TOC, code copy, image zoom and search.
(function () {
  const T = {{ dict
    "lang" site.Language.Lang
    "copy" (T "copy")
    "copied" (T "copied")
    "noResults" (T "noResults")
    "resultsOne" (T "resultsOne")
    "resultsFew" (T "resultsFew")
    "resultsMany" (T "resultsMany")
    | jsonify | safeJS }};
  const root = document.documentElement;
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));

  // Theme: light, dark or the system preference, kept in localStorage under "color-theme".
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  function applyTheme(value) {
    const dark = value === 'dark' || (value === 'system' && systemDark.matches);
    root.classList.toggle('dark', dark);
    root.classList.toggle('light', !dark);
    root.dataset.theme = value;
    $$('[data-theme-value]').forEach((button) => button.setAttribute('aria-checked', String(button.dataset.themeValue === value)));
  }
  $$('[data-theme-value]').forEach((button) => button.addEventListener('click', () => {
    const value = button.dataset.themeValue;
    try {
      if (value === 'system') localStorage.removeItem('color-theme');
      else localStorage.setItem('color-theme', value);
    } catch (e) { /* storage unavailable */ }
    applyTheme(value);
  }));
  systemDark.addEventListener('change', () => { if (root.dataset.theme === 'system') applyTheme('system'); });
  applyTheme(root.dataset.theme || 'system');

  // Dropdown menus.
  function closeDropdowns(except) {
    $$('.sx-dropdown.sx-open').forEach((dropdown) => {
      if (dropdown === except) return;
      dropdown.classList.remove('sx-open');
      dropdown.querySelector('.sx-button').setAttribute('aria-expanded', 'false');
    });
  }
  $$('.sx-dropdown > .sx-button').forEach((button) => button.addEventListener('click', (event) => {
    event.stopPropagation();
    const dropdown = button.parentElement;
    closeDropdowns(dropdown);
    const open = dropdown.classList.toggle('sx-open');
    button.setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', (event) => { if (!event.target.closest('.sx-menu')) closeDropdowns(); });

  // Collapsible sections in the sidebar.
  $$('.sx-nav-toggle').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    button.closest('li').classList.toggle('sx-open');
  }));

  // Sheets: the sidebar and the TOC on narrow screens.
  const backdrop = document.querySelector('body > .sx-backdrop, .sx-body + .sx-backdrop');
  function closeSheets() {
    $$('[data-sheet].sx-sheet-open').forEach((sheet) => sheet.classList.remove('sx-sheet-open'));
    $$('[data-sheet-open]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    if (backdrop) backdrop.hidden = true;
    document.body.style.overflow = '';
  }
  $$('[data-sheet-open]').forEach((button) => button.addEventListener('click', (event) => {
    event.stopPropagation();
    const name = button.dataset.sheetOpen;
    const sheet = document.querySelector(`[data-sheet="${name}"]`);
    const open = !sheet.classList.contains('sx-sheet-open');
    closeSheets();
    if (!open) return;
    sheet.classList.add('sx-sheet-open');
    button.setAttribute('aria-expanded', 'true');
    if (name === 'sidebar') {
      backdrop.hidden = false;
      document.body.style.overflow = 'hidden';
    }
  }));
  $$('[data-sheet-close]').forEach((button) => button.addEventListener('click', closeSheets));
  if (backdrop) backdrop.addEventListener('click', closeSheets);
  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-sheet], [data-sheet-open]')) closeSheets();
  });
  $$('[data-sheet] a[href]').forEach((link) => link.addEventListener('click', () => setTimeout(closeSheets, 0)));

  // Table of contents: like GitBook, a heading becomes current once it is fully inside the upper part of the area below the header.
  const tocLinks = $$('.sx-toc-list a');
  const headings = tocLinks.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))));
  function setActive(index) {
    tocLinks.forEach((link, i) => link.classList.toggle('sx-active', i === index));
  }
  let observer = null;
  function observeHeadings() {
    if (observer) observer.disconnect();
    const header = 64;
    observer = new IntersectionObserver((entries) => {
      const entered = entries.filter((entry) => entry.isIntersecting);
      if (!entered.length) return;
      const target = entered[0].target;
      setActive(headings.indexOf(target));
    }, { rootMargin: `-${header}px 0px -40% 0px`, threshold: 1 });
    headings.forEach((heading) => heading && observer.observe(heading));
  }
  if (tocLinks.length) {
    setActive(0);
    observeHeadings();
  }

  // Copy buttons of code blocks.
  $$('.sx-code-copy').forEach((button) => button.addEventListener('click', async () => {
    const code = button.parentElement.querySelector('code').textContent;
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = T.copied;
      setTimeout(() => { button.textContent = T.copy; }, 1500);
    } catch (e) { /* clipboard unavailable */ }
  }));

  // Image zoom.
  $$('.sx-figure img').forEach((image) => image.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.className = 'sx-zoom';
    const copy = image.cloneNode();
    copy.removeAttribute('loading');
    overlay.appendChild(copy);
    const close = () => { overlay.remove(); removeEventListener('keydown', onKey); };
    const onKey = (event) => { if (event.key === 'Escape') close(); };
    overlay.addEventListener('click', close);
    addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
  }));

  // "Last updated" as relative time.
  const relative = new Intl.RelativeTimeFormat(T.lang, { numeric: 'always' });
  $$('.sx-page-footer time').forEach((time) => {
    const seconds = (new Date(time.dateTime) - Date.now()) / 1000;
    const units = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
    const [unit, size] = units.find(([, size]) => Math.abs(seconds) >= size) || units[units.length - 1];
    time.textContent = relative.format(Math.round(seconds / size), unit);
    time.title = new Date(time.dateTime).toLocaleString(T.lang);
  });

  // Page not found: suggest pages that match the words of the address, and search from the box.
  const notFound = document.querySelector('.sx-notfound');
  if (notFound) {
    const terms = decodeURIComponent(location.pathname).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 2 && word !== T.lang);
    fetch(notFound.dataset.index).then((response) => response.json()).then((pages) => {
      const scored = pages.map((page) => ({ page, score: terms.reduce((n, term) => n + (page.title.toLowerCase().includes(term) ? 10 : 0) + (page.url.includes(term) ? 5 : 0), 0) }))
        .filter((item) => item.score).sort((a, b) => b.score - a.score).slice(0, 5);
      if (!scored.length) return;
      const list = notFound.querySelector('.sx-notfound-list ul');
      const icon = list.querySelector('svg').outerHTML;
      list.innerHTML = scored.map(({ page }) => `<li><a href="${page.url}">${icon}<span>${page.title.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))}</span></a></li>`).join('');
    }).catch(() => {});
    notFound.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const header = document.querySelector('.sx-search-input');
      header.value = notFound.querySelector('input').value;
      header.focus();
      header.dispatchEvent(new Event('input'));
    });
  }

  // Search.
  const search = document.querySelector('.sx-search');
  if (!search) return;
  const input = search.querySelector('.sx-search-input');
  const box = search.querySelector('.sx-search-box');
  const panel = search.querySelector('.sx-search-panel');
  const list = search.querySelector('.sx-search-results');
  const count = search.querySelector('.sx-search-count');
  const clear = search.querySelector('.sx-search-clear');
  const icon = search.querySelector('.sx-search-icon');
  const pageIcon = {{ partial "seedex/icon.html" (dict "name" "file" "class" "sx-result-page") | jsonify | safeJS }};
  const goIcon = '<span class="sx-result-go">' + {{ partial "seedex/icon.html" (dict "name" "chevron-right" "class" "sx-result-next") | jsonify | safeJS }} + {{ partial "seedex/icon.html" (dict "name" "return" "class" "sx-result-enter") | jsonify | safeJS }} + '</span>';
  let pages = null;
  let selected = 0;

  async function load() {
    if (!pages) pages = fetch(search.dataset.index).then((response) => response.json());
    return pages;
  }
  const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const words = (query) => query.toLowerCase().split(/[^\p{L}\p{N}_-]+/u).filter(Boolean);
  function plural(n) {
    if (T.lang === 'ru') {
      const mod10 = n % 10, mod100 = n % 100;
      const form = mod10 === 1 && mod100 !== 11 ? T.resultsOne : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? T.resultsFew : T.resultsMany;
      return form.replace('{n}', n);
    }
    return (n === 1 ? T.resultsOne : T.resultsMany).replace('{n}', n);
  }
  function excerpt(text, terms) {
    const lower = text.toLowerCase();
    const first = Math.min(...terms.map((term) => { const at = lower.indexOf(term); return at < 0 ? Infinity : at; }));
    let start = first === Infinity ? 0 : Math.max(0, lower.lastIndexOf(' ', Math.max(0, first - 40)) + 1);
    if (start > 0 && first - start > 60) start = first;
    let result = escape(text.slice(start, start + 200));
    for (const term of terms) result = result.replace(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>');
    return (start > 0 ? '…' : '') + result;
  }
  function rank(page, terms) {
    let best = null;
    for (const section of page.sections) {
      const heading = section.heading.toLowerCase();
      const text = section.text.toLowerCase();
      let score = 0;
      for (const term of terms) {
        const inText = text.split(term).length - 1;
        const inHeading = heading.includes(term);
        if (!inText && !inHeading && !page.title.toLowerCase().includes(term)) { score = 0; break; }
        score += inText + (inHeading ? 10 : 0);
      }
      if (score && (!best || score > best.score)) best = { score, section };
    }
    if (!best) return null;
    const titleBonus = terms.every((term) => page.title.toLowerCase().includes(term)) ? 20 : 0;
    const total = page.sections.reduce((sum, section) => sum + terms.reduce((n, term) => n + (section.text.toLowerCase().split(term).length - 1), 0), 0);
    return { page, section: best.section, score: best.score + titleBonus + total };
  }
  function select(index) {
    const links = $$('a', list);
    if (!links.length) return;
    selected = (index + links.length) % links.length;
    links.forEach((link, i) => link.setAttribute('aria-selected', String(i === selected)));
    links[selected].scrollIntoView({ block: 'nearest' });
  }
  async function run() {
    const query = input.value.trim();
    const terms = words(query);
    clear.hidden = !input.value;
    icon.hidden = !!input.value;
    if (!terms.length) { panel.hidden = true; count.hidden = true; return; }
    const results = (await load()).map((page) => rank(page, terms)).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 10);
    if (input.value.trim() !== query) return;
    count.hidden = false;
    count.textContent = results.length ? plural(results.length) : T.noResults;
    list.innerHTML = results.length ? results.map(({ page, section }) => {
      const url = page.url + (section.id ? '#' + section.id : '');
      const text = (section.heading ? `${escape(section.heading)} · ` : '') + excerpt(section.text, terms);
      return `<li><a href="${url}">${pageIcon}<span class="sx-result-text">${page.crumb ? `<span class="sx-result-crumb">${escape(page.crumb)}</span>` : ''}<span class="sx-result-title">${escape(page.title)}</span><span class="sx-result-excerpt">${text}</span></span>${goIcon}</a></li>`;
    }).join('') : `<li class="sx-search-empty">${escape(T.noResults)}</li>`;
    panel.hidden = false;
    select(0);
  }
  const narrow = matchMedia('(max-width: 767px)');
  const searchBackdrop = document.querySelector('.sx-search-backdrop');
  function activate() {
    search.classList.add('sx-active');
    if (narrow.matches) { closeSheets(); searchBackdrop.hidden = false; document.body.style.overflow = 'hidden'; }
    load();
  }
  function close(force) {
    panel.hidden = true;
    if (force || !input.value || narrow.matches) {
      if (force || narrow.matches) { input.value = ''; clear.hidden = true; icon.hidden = false; }
      search.classList.remove('sx-active');
      count.hidden = true;
      if (narrow.matches) { searchBackdrop.hidden = true; document.body.style.overflow = ''; }
    }
  }
  search.querySelector('.sx-search-close').addEventListener('click', (event) => { event.stopPropagation(); close(true); });
  box.addEventListener('click', () => { activate(); input.focus(); });
  input.addEventListener('focus', () => { activate(); if (input.value) run(); });
  input.addEventListener('input', run);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); select(selected + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); select(selected - 1); }
    else if (event.key === 'Enter') { const link = $$('a', list)[selected]; if (link && !panel.hidden) location.href = link.href; }
    else if (event.key === 'Escape') { input.value = ''; run(); input.blur(); close(true); }
  });
  clear.addEventListener('click', (event) => { event.stopPropagation(); input.value = ''; run(); input.focus(); });
  document.addEventListener('click', (event) => { if (!search.contains(event.target) && !event.target.closest('[data-sheet-open]')) close(); });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); activate(); input.focus(); input.select(); }
  });
})();
