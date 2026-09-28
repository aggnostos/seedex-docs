HUGO ?= hugo

.PHONY: prepare serve build
prepare:
	python3 scripts/prepare-hugo.py

serve: prepare
	$(HUGO) server --bind 127.0.0.1 --disableFastRender --noHTTPCache

build: prepare
	$(HUGO) --minify
