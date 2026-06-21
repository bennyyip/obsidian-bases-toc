.PHONY: install

install: main.js manifest.json
	cp $^ $(HOME)/Obsidian-Vault/.obsidian/plugins/bases-toc/
	obsidian.com reload

main.js: main.ts toc-view.ts
	pnpm build
