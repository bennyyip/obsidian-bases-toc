import {
	App,
	BasesView,
	QueryController,
	ViewOption,
} from 'obsidian';

const DEFAULT_HEADING_MIN_LEVEL = 1
const DEFAULT_HEADING_MAX_LEVEL = 6
const DEFAULT_HEADING_BLACKLIST = ['toc', 'table_of_contents']

export class TocView extends BasesView {
	type = 'toc';
	scrollEl: HTMLElement;
	containerEl: HTMLElement;
	tocEl: HTMLElement;
	app: App

	headingMinLevel: number = DEFAULT_HEADING_MIN_LEVEL
	headingMaxLevel: number = DEFAULT_HEADING_MAX_LEVEL
	headingBlacklist: Set<string> = new Set(DEFAULT_HEADING_BLACKLIST)

	constructor(controller: QueryController, scrollEl: HTMLElement, app: App) {
		super(controller);
		this.scrollEl = scrollEl;
		this.containerEl = scrollEl.createDiv({ cls: 'bases-toc-container is-loading', attr: { tabIndex: 0 } });
		this.tocEl = this.containerEl.createDiv('bases-toc');
		this.app = app
	}

	public onDataUpdated(): void {
		this.containerEl.removeClass('is-loading');
		this.loadConfig();

		this.tocEl.remove()
		this.tocEl = this.containerEl.createDiv('bases-toc');
		const ul = this.tocEl.createEl('ul')
		for (const entry of this.data.data) {
			const li = ul.createEl('li')

			li.createEl('a', {
				text: entry.file.basename,
				href: entry.file.path,
			}).addClasses(['internal-link', 'bases-toc-file'])


			this.createHeadings(entry.file.path, li.createEl('ul'))
		}
	}

	private createHeadings(filepath: string, ul: HTMLUListElement) {
		const cache = this.app.metadataCache.getCache(filepath);
		if (!cache) return null

		let headings = cache.headings;
		if (!headings) return null

		headings = headings
			.filter(h => h.level >= this.headingMinLevel && h.level <= this.headingMaxLevel)
			.filter(h => {
				const text = h.heading.split('#')[0].replace(/ /g, "_").toLowerCase();
				return !this.headingBlacklist.has(text)
			})

		const minLevel = Math.max(this.headingMinLevel, Math.min(...headings.map(h => h.level)))
		let level2ul = {
			[minLevel]: ul
		}
		let prevLevel = minLevel
		let prevUl = ul

		headings.forEach(h => {
			const level = h.level
			const text = h.heading.split('#')[0]
			let file_head = h.heading

			// remove backticks and tag symbols
			file_head = file_head.replace(/`/g, '');
			file_head = file_head.replace(/#/g, '');

			const link = filepath + '#' + text

			if (level > prevLevel) {
				level2ul[level] = level2ul[prevLevel].createEl('ul')
			}

			level2ul[level].createEl('li').createEl('a', {
				text: text,
				href: link
			}).addClass('internal-link')

			prevLevel = level
		})

	}

	private loadConfig(): void {
		this.headingMinLevel = this.getNumericConfig('headingMinLevel', 1)
		this.headingMaxLevel = this.getNumericConfig('headingMaxLevel', 6)
		this.headingBlacklist = new Set(this.getArrayConfig('headingBlacklist'))
	}

	private getNumericConfig(key: string, defaultValue: number, min?: number, max?: number): number {
		const value = this.config.get(key);
		if (!value || !Number.isNumber(value)) return defaultValue;

		let result = value;
		if (min !== undefined) result = Math.max(min, result);
		if (max !== undefined) result = Math.min(max, result);
		return result;
	}

	private getArrayConfig(key: string): string[] {
		const value = this.config.get(key);
		if (!value) return [];

		// Handle array values
		if (Array.isArray(value)) {
			return value.filter(item => typeof item === 'string' && item.trim().length > 0);
		}

		// Handle single string value
		if (typeof value === 'string' && value.trim().length > 0) {
			return [value.trim()];
		}

		return [];
	}

	static getViewOptions(): ViewOption[] {
		return [
			{
				type: 'slider',
				displayName: "Min Heading Level",
				min: 1,
				max: 6,
				step: 1,
				default: DEFAULT_HEADING_MIN_LEVEL,
				key: 'headingMinLevel',
			},
			{
				type: 'slider',
				displayName: "Max Heading Level",
				min: 1,
				max: 6,
				step: 1,
				default: DEFAULT_HEADING_MAX_LEVEL,
				key: 'headingMaxLevel',
			},
			{
				type: 'multitext',
				displayName: "Heading Blacklist",
				default: DEFAULT_HEADING_BLACKLIST,
				key: 'headingBlacklist',
			}
		]
	}

}
