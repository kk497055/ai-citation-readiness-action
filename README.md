# AI Citation Readiness Check

A zero-configuration GitHub Action that scans a built static website and reports five clarity, evidence, structure, and crawlability signals in the workflow summary.

[Run the visual browser audit on Klyrone](https://klyrone.com/tools/ai-citation-readiness)

## Usage

```yaml
name: AI citation readiness
on: [push]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: kk497055/ai-citation-readiness-action@v1
        with:
          path: .
```

For frameworks, run the build first and point `path` to the output directory such as `dist`, `build`, or `out`.

The action checks for:

- A descriptive homepage title and H1
- A FAQ, pricing, or process answer surface
- Linked evidence or trust language
- Relevant schema.org structured data
- `robots.txt` and `sitemap.xml`

The result is directional and cannot guarantee indexing, ranking, or AI citation.

## Complete 25-point audit

- [Compare consultation and self-serve options](https://klyrone.com/tools/ai-citation-readiness)
- [Get the private offline toolkit for $9](https://payhip.com/b/Kez3L)
- [Alternative checkout on itch.io](https://kk497055.itch.io/ai-citation-readiness-scorecard)

## License

MIT
