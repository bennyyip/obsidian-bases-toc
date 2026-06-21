.PHONY: install lint fmt

TS_FILES = main.ts toc-view.ts

install: main.js manifest.json styles.css
	cp $^ $(HOME)/Obsidian-Vault/.obsidian/plugins/bases-toc/
	obsidian.com reload

lint:
	pnpm eslint

main.js: $(TS_FILES)
	pnpm build

fmt: $(TS_FILES)
	biome format --fix $^
