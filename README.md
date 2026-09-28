# Seedex documentation

Source for [docs.seedex.net](https://docs.seedex.net), built with Hugo.

## Local preview

Install Hugo Extended **0.166.0** and Python **3.9 or later**.

```sh
make serve
```

Open the local address printed by Hugo. Edit the Markdown files in `en/` and `ru/`, with navigation in their `SUMMARY.md` files. After editing source content, run `make prepare` in another terminal; the preview will reload.

The preparation script generates ignored Hugo content in `.hugo/content/` and `.hugo/data/`: it converts GitBook hint blocks, resolves page and image links, and prepares code highlighting. Do not edit generated files. Existing GitBook sources and configuration are retained during migration.

## Build and check

```sh
make build
python3 scripts/check-site.py
```

The generated website is in `public/`. English pages retain their root URLs, Russian pages use `/ru/`, and `/en/` aliases redirect to English pages. Images are served from `/assets/`.

## Publishing

The Documentation workflow builds and checks every push to `main` and `hugo`, and every pull request. A push to `main` also publishes the site to GitHub Pages; other runs only upload the built site as an artifact. A manual run with **Publish this build to GitHub Pages** enabled publishes any branch.

For the migration:

1. Review the local site and the successful Actions build.
2. In repository Settings → Pages, choose GitHub Actions as the source. Ensure the `github-pages` environment permits the branch you intend to deploy.
3. Merge `hugo` into `main`, or run the Documentation workflow manually with **Publish this build to GitHub Pages** enabled.
4. Configure the custom domain `docs.seedex.net` in Pages, then change its DNS record to the value required by GitHub Pages. Verify domain ownership and enable HTTPS once the certificate is ready.
5. Check the live English and Russian pages before disconnecting GitBook.

The production base URL is set in `hugo.yaml`. To preview on a different hosting URL, build with `hugo --baseURL https://your-preview-host/` after `make prepare`.

Project code: [seedex-openwrt](https://github.com/aggnostos/seedex-openwrt) and [seedex-agent](https://github.com/aggnostos/seedex-agent).

## Appearance

The site reproduces the GitBook design of the previous docs.seedex.net without a Hugo theme. Its templates live in `layouts/`, with the header, sidebar, table of contents, page and search in `layouts/_partials/seedex/`.

- `theme-assets/css/seedex.css` holds the GitBook palette for the light and dark themes, the layout and the breakpoints.
- `theme-assets/js/seedex.js` switches the theme, opens the menus and the mobile panels, highlights the current section in the table of contents, copies code and runs the search.
- `layouts/_partials/seedex/icon.html` holds the icons as GitBook renders them.
- `scripts/prepare-hugo.py` colours `sh` code blocks the way GitBook's highlighter does and takes each page's last update date from Git.

Font files and their OFL licenses live in `static/fonts/`; readers do not load fonts from GitBook.
