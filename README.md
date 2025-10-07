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

# Screenshot
<img width="1117" height="1716" alt="image" src="https://github.com/user-attachments/assets/9a8367d4-a25b-4bd2-bb0e-ede00167a33b" />
