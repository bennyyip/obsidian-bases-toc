import {
    App,
    BasesView,
    QueryController,
    ViewOption,
} from 'obsidian'

const DEFAULT_HEADING_MAX_LEVEL = 6
const DEFAULT_HEADING_BLACKLIST = ['toc', 'table_of_contents']

export class TocView extends BasesView {
    type = 'toc'
    scrollEl: HTMLElement
    containerEl: HTMLElement
    tocEl: HTMLElement
    app: App

    headingMaxLevel: number = DEFAULT_HEADING_MAX_LEVEL
    headingBlacklist: Set<string> = new Set(DEFAULT_HEADING_BLACKLIST)

    constructor(controller: QueryController, scrollEl: HTMLElement) {
        super(controller)
        this.scrollEl = scrollEl
        this.containerEl = scrollEl.createDiv({ cls: 'bases-toc-container is-loading', attr: { tabIndex: 0 } })
        this.tocEl = this.containerEl.createDiv('ul')
    }

    public onDataUpdated(): void {
        this.containerEl.removeClass('is-loading')
        this.loadConfig()

        this.tocEl.remove()
        this.tocEl = this.containerEl.createDiv('ul')
        let ul = this.tocEl
        for (const group of this.data.groupedData) {
            if (group.hasKey()) {
                // if (group.entries == 1 && group.entries[0].file.path = this.file.path)
                this.tocEl.createEl('span', { text: group.key?.toString() })
                ul = this.tocEl.createEl('ul')
            }

            for (const entry of group.entries) {
                const li = ul.createEl('li')

                li.createEl('a', {
                    text: entry.file.basename,
                    href: entry.file.path,
                }).addClasses(['internal-link', 'bases-toc-file'])


                if (this.headingMaxLevel > 0)
                    this.createHeadings(entry.file.path, li.createEl('ul'))

            }
        }
    }

    private createHeadings(filepath: string, ul: HTMLUListElement) {
        const cache = this.app.metadataCache.getCache(filepath)
        if (!cache) return null

        let headings = cache.headings
        if (!headings) return null

        headings = headings
            .filter(h => h.level <= this.headingMaxLevel)
            .filter(h => {
                const text = h.heading.split('#')[0].replace(/ /g, "_").toLowerCase()
                return !this.headingBlacklist.has(text)
            })

        const minLevel = Math.min(...headings.map(h => h.level))
        let level2ul = {
            [minLevel]: ul
        }
        let prevLevel = minLevel

        headings.forEach(h => {
            const level = h.level
            const text = h.heading.split('#')[0]
            let file_head = h.heading

            // remove backticks and tag symbols
            file_head = file_head.replace(/`/g, '')
            file_head = file_head.replace(/#/g, '')

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
        this.headingMaxLevel = this.config.get('headingMaxLevel') as number
        this.headingBlacklist = new Set(this.config.get('headingBlacklist') as string[])
    }

    static getViewOptions(): ViewOption[] {
        return [
            {
                type: 'slider',
                displayName: "Max Heading Level",
                min: 0,
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
