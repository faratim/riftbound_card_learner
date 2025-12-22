# Card Data Scripts

## fetch-cards.js

This script fetches the complete Riftbound card database from the official Riftbound card gallery website.

### Usage

```bash
node scripts/fetch-cards.js
```

### What it does

1. Fetches the official Riftbound card gallery page
2. Extracts the embedded card data from the Next.js page props
3. Transforms the data to match our app's format
4. Saves all cards to `src/riftbound-cards-new.json`
5. Creates a backup of Spiritforged cards in `scripts/spiritforged-cards.json`

### Output

- **Total cards**: 664
  - Origins (OGN): 352 cards
  - Spiritforged (SFD): 288 cards (including variants)
  - Proving Grounds (OGS): 24 cards

### When to run

Run this script when:
- New cards are released
- Card data needs to be updated
- You want to refresh the database with the latest information

### Manual steps after running

1. Review the generated `src/riftbound-cards-new.json` file
2. If everything looks good, replace the old file:
   ```bash
   mv src/riftbound-cards.json src/riftbound-cards-old.json
   mv src/riftbound-cards-new.json src/riftbound-cards.json
   ```
3. Test the app to ensure everything works

## Notes

- The script uses the official Riftbound card gallery as the data source
- Card images are hosted on Riot's CDN
- The data includes all card variants (regular and showcase editions)
