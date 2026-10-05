# Fieldwork Companions SVG workflow

The production homepage references the eight SVG files in `content/assets/characters/` directly. The design-study HTML files are review artifacts, not editable artwork sources.

## Commands

```bash
npm run companions:check
npm run companions:review
```

- `companions:check` validates the manifest, all SVG contracts, the exact production asset set, and the decorative homepage references.
- `companions:review` runs validation first and regenerates `.agents/design-explorations/fieldwork-companions-review.generated.html` from the production manifest and SVG files.

Both commands run without installing additional packages.

## Source of truth

- `content/assets/characters/manifest.json` defines the fixed family order, course metadata, card backgrounds, filenames, and approved palette.
- The eight sibling `.svg` files contain the production geometry.
- `content/index.md` contains one decorative `<img>` reference for every manifest entry.
- `scripts/companion-assets.mjs` owns validation and review-board generation.
- `scripts/companion-assets.test.mjs` protects the workflow contract.

Do not copy SVG path data into a hand-maintained review page. Regenerate the review board so it always renders the production assets.

## Illustration contract

Every companion must:

- use `viewBox="0 0 200 150"`;
- include the SVG namespace;
- use the shared `3`-unit structural stroke;
- use only the manifest palette:
  - ink `#172536`;
  - cream `#f5eddc`;
  - pale blue `#a9c9e8`;
  - warm action `#e0a243`;
  - secondary warm `#bd6847`;
- remain faceless and communicate through construction, posture, and action;
- have one dominant course action and at most one supporting prop;
- remain recognizable at the homepage mobile size of `120 × 110`;
- remain legible in monochrome;
- contain no IDs, scripts, embedded images, foreign objects, or external/data-URL resources.

Keep warm color on the active decision, selected object, or intervention. Do not use warm color as general decoration.

## Creating or revising a companion

1. Read the course overview and learning outcomes. Write the dominant action in one verb phrase before drawing.
2. Update the entry in `content/assets/characters/manifest.json` if its companion name, action, meaning, filename, or card background changes.
3. Create or edit the named SVG. Preserve the illustration contract above and the `200 × 150` safe canvas.
4. If the filename changes, update the corresponding decorative image reference in `content/index.md`.
5. Run `npm run companions:check`. Fix every reported contract or reference error.
6. Run `npm run companions:review` and open the generated HTML review board.
7. Review the family at full card size, monochrome, and `120 × 110`. Check both page themes and a true `390px` viewport before production approval.
8. Run the repository gates:

   ```bash
   npm run check
   npm test
   npx quartz build
   git diff --check
   ```

## Changing the size or palette

Treat a viewBox, stroke, or palette change as a family-wide design-system migration:

1. update `manifest.json`;
2. update every SVG;
3. update validator expectations and tests first;
4. regenerate the review board;
5. visually review all eight assets together.

Never weaken validation for a one-off exception. If an exception is genuinely needed, document the new family rule and migrate the full set.
