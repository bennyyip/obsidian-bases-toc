.PHONY: install lint

install: main.js manifest.json styles.css
	cp $^ $(HOME)/Obsidian-Vault/.obsidian/plugins/bases-toc/
	obsidian.com reload

lint:
	pnpm eslint

main.js: main.ts toc-view.ts
	pnpm build
