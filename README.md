# Bases TOC
List headings of filtered files.

List files in the same directory:
```yaml
filters:
  and:
    - file.folder == this.file.folder
    - file.path != this.file.path
    - file.ext == "md"
views:
  - type: toc
    name: toc
```

List files in the same directory, recursively:
```yaml
filters:
  and:
    - file.folder.startsWith(this.file.folder)
    - file.path != this.file.path
    - file.ext == "md"
views:
  - type: toc
    name: toc
```
