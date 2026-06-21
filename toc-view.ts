import {
  MarkdownRenderer,
  // setIcon,
  BasesView,
  QueryController,
  BasesAllOptions,
} from "obsidian"

const DEFAULT_HEADING_MAX_LEVEL = 6
const DEFAULT_HEADING_BLACKLIST = ["toc", "table_of_contents"]

// const createCollapseIndicator = (el: HTMLElement) => {
//   const indicator = el.createSpan({
//     cls: "base-toc-collapse-indicator collapse-indicator collapse-icon",
//     prepend: true,
//   });
//   setIcon(indicator, "right-triangle");

//   indicator.addEventListener("click", () => {
//     const collapsed = indicator.hasClass("collapsed");
//     indicator.toggleClass("collapsed", !collapsed);
//     console.log(`indicator.parent: `, indicator.parentElement);
//     indicator.parentElement?.querySelectorAll(":scope > ul").forEach((x) => {
//       x.toggleClass("collapsed", !collapsed);
//     });
//   });

//   return indicator;
// };

export class TocView extends BasesView {
  type = "toc"
  scrollEl: HTMLElement
  containerEl: HTMLElement
  tocEl: HTMLElement

  headingMaxLevel: number = DEFAULT_HEADING_MAX_LEVEL
  headingBlacklist: Set<string> = new Set(DEFAULT_HEADING_BLACKLIST)

  constructor(controller: QueryController, scrollEl: HTMLElement) {
    super(controller)
    this.scrollEl = scrollEl
    this.containerEl = scrollEl.createDiv({
      cls: "bases-toc-container is-loading",
      attr: { tabIndex: 0 },
    })
    this.tocEl = this.containerEl.createDiv("base-toc-content")
  }

  public onDataUpdated() {
    this.containerEl.removeClass("is-loading")
    this.loadConfig()

    this.tocEl.remove()
    this.tocEl = this.containerEl.createDiv("base-toc-content")

    const markdown = []

    for (const group of this.data.groupedData) {
      for (const entry of group.entries) {
        markdown.push([`- [[${entry.file.path}|${entry.file.basename}]]`])

        if (this.headingMaxLevel > 0) {
          markdown.push(...this.createHeadings(entry.file.path))
        }
      }
    }
    void MarkdownRenderer.render(
      this.app,
      markdown.filter(Boolean).join("\n"),
      this.tocEl,
      "",
      this,
    ).then(() => {
      this.tocEl.querySelectorAll("a.internal-link").forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault()
          const href = link.getAttribute("data-href")
          if (href) {
            void this.app.workspace.openLinkText(href, "", false)
          }
        })
      })
    })
  }

  private createHeadings(filepath: string): string[] {
    let res: string[] = []

    const cache = this.app.metadataCache.getCache(filepath)
    if (!cache) return res

    let headings = cache.headings
    if (!headings) return res

    headings = headings
      .filter((h) => h.level <= this.headingMaxLevel)
      .filter((h) => {
        const text = h.heading.split("#")[0]!.replace(/ /g, "_").toLowerCase()
        return !this.headingBlacklist.has(text)
      })

    const minLevel = Math.min(...headings.map((h) => h.level))

    headings.forEach((h) => {
      const level = h.level
      const text = h.heading.split("#")[0]

      // let file_head = h.heading;
      // remove backticks and tag symbols
      // file_head = file_head.replace(/`/g, "");
      // file_head = file_head.replace(/#/g, "");

      const link = filepath + "#" + text

      const indent = "\t".repeat(level - minLevel + 1)

      res.push(`${indent}1. [[${link}|${text}]]`)
    })
    return res
  }

  private loadConfig(): void {
    this.headingMaxLevel = this.getNumericConfig(
      "headingMaxLevel",
      DEFAULT_HEADING_MAX_LEVEL,
      0,
      6,
    )
    this.headingBlacklist = new Set(
      this.getArrayConfig("headingBlacklist", DEFAULT_HEADING_BLACKLIST),
    )
  }

  private getNumericConfig(
    key: string,
    defaultValue: number,
    min?: number,
    max?: number,
  ): number {
    const value = this.config.get(key)
    if (value == null || typeof value !== "number") return defaultValue

    let result = value
    if (min !== undefined) result = Math.max(min, result)
    if (max !== undefined) result = Math.min(max, result)
    return result
  }

  private getArrayConfig(key: string, defaultValue: string[]): string[] {
    const value = this.config.get(key)
    if (value == null) return defaultValue

    // Handle array values
    if (Array.isArray(value)) {
      return value.filter(
        (item) => typeof item === "string" && item.trim().length > 0,
      ) as string[]
    }

    // Handle single string value
    if (typeof value === "string" && value.trim().length > 0) {
      return [value.trim()]
    }

    return defaultValue
  }

  static getViewOptions(this: void): BasesAllOptions[] {
    return [
      {
        type: "slider",
        displayName: "Max Heading Level",
        min: 0,
        max: 6,
        step: 1,
        default: DEFAULT_HEADING_MAX_LEVEL,
        key: "headingMaxLevel",
      },
      {
        type: "multitext",
        displayName: "Heading Blacklist",
        default: DEFAULT_HEADING_BLACKLIST,
        key: "headingBlacklist",
      },
    ]
  }
}
