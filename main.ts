import { Plugin } from 'obsidian';
import { TocView } from './toc-view';

export default class ObsidianTocsPlugin extends Plugin {
	async onload() {
		this.registerBasesView('toc', {
			name: 'TOC',
			icon: 'lucide-table-of-contents',
			factory: (controller, containerEl) => new TocView(controller, containerEl),
			options: TocView.getViewOptions,
		});
	}

	onunload() {
	}
}
