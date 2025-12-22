/**
 * Script to fetch Riftbound card data from the official card gallery
 * This extracts the embedded JSON data from the Next.js page
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARD_GALLERY_URL = 'https://riftbound.leagueoflegends.com/en-us/card-gallery/';

function transformCard(card) {
  // Transform the API format to our app's format
  const transformed = {
    id: card.id,
    name: card.name,
    collectorNumber: card.collectorNumber,
    publicCode: card.publicCode || `${card.set?.value?.id}-${String(card.collectorNumber).padStart(3, '0')}`,
    orientation: card.orientation || 'portrait',
    set: card.set?.value?.id || 'UNKNOWN',
    setName: card.set?.value?.label || 'Unknown',
    domains: card.domain?.values?.map(d => ({
      id: d.id,
      label: d.label
    })) || [],
    rarity: {
      id: card.rarity?.value?.id || 'common',
      label: card.rarity?.value?.label || 'Common'
    },
    cardType: card.cardType?.values?.map(t => ({
      id: t.id,
      label: t.label
    })) || [],
    cardImage: {
      url: card.cardImage?.url || '',
      colors: card.cardImage?.colors || { primary: '#000000', secondary: '#FFFFFF', label: '#000000' },
      accessibilityText: card.cardImage?.accessibilityText || ''
    },
    illustrator: Array.isArray(card.illustrator)
      ? card.illustrator
      : (card.illustrator?.values?.map(i => i.label) || []),
    text: typeof card.text === 'string'
      ? card.text
      : (card.text?.richText?.body || ''),
  };

  // Add optional fields if they exist
  if (card.energy !== undefined && card.energy !== null) {
    transformed.energy = typeof card.energy === 'number'
      ? card.energy
      : (card.energy?.value?.id || null);
  }
  if (card.power !== undefined && card.power !== null) {
    transformed.power = typeof card.power === 'number'
      ? card.power
      : (card.power?.value?.id || null);
  }
  if (card.might !== undefined && card.might !== null) {
    transformed.might = typeof card.might === 'number'
      ? card.might
      : (card.might?.value?.id || null);
  }

  return transformed;
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function extractCardData(html) {
  // Look for Next.js data in the HTML
  // The data is typically in a script tag with id="__NEXT_DATA__"
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);

  if (nextDataMatch) {
    try {
      const jsonData = JSON.parse(nextDataMatch[1]);

      // Navigate through the Next.js props structure to find card data
      // This structure may vary, so we'll need to explore it
      console.log('Found Next.js data structure');

      // Try to find cards in the props
      const props = jsonData?.props?.pageProps;

      if (props) {
        // Navigate through the blades structure to find the card gallery
        const cardGalleryBlade = props.page?.blades?.find(
          blade => blade.type === 'riftboundCardGallery'
        );

        if (cardGalleryBlade?.cards?.items) {
          return cardGalleryBlade.cards.items;
        } else {
          // Save the entire props structure for debugging
          fs.writeFileSync(
            path.join(__dirname, 'page-props.json'),
            JSON.stringify(props, null, 2)
          );
          console.log('Card data structure not found, saved props to page-props.json');
          return null;
        }
      }
    } catch (err) {
      console.error('Error parsing JSON:', err);
      return null;
    }
  }

  console.log('Could not find __NEXT_DATA__ in the HTML');
  return null;
}

async function main() {
  try {
    console.log('Fetching card gallery page...');
    const html = await fetchPage(CARD_GALLERY_URL);

    console.log('Extracting card data...');
    const cards = extractCardData(html);

    if (cards && Array.isArray(cards)) {
      console.log(`Found ${cards.length} raw cards`);

      // Transform cards to our format
      const transformedCards = cards.map(transformCard);

      // Count by set
      const setByCounts = transformedCards.reduce((acc, card) => {
        const set = card.set || 'unknown';
        acc[set] = (acc[set] || 0) + 1;
        return acc;
      }, {});

      console.log('Cards by set:', setByCounts);

      // Save all cards
      const outputPath = path.join(__dirname, '..', 'src', 'riftbound-cards-new.json');
      fs.writeFileSync(outputPath, JSON.stringify(transformedCards, null, 2));
      console.log(`Saved ${transformedCards.length} cards to ${outputPath}`);

      // Save just Spiritforged cards for inspection
      const sfdCards = transformedCards.filter(c => c.set === 'SFD');
      fs.writeFileSync(
        path.join(__dirname, 'spiritforged-cards.json'),
        JSON.stringify(sfdCards, null, 2)
      );
      console.log(`Saved ${sfdCards.length} Spiritforged cards to spiritforged-cards.json`);
    } else {
      console.log('No card data found. Check the page-props.json file to locate the cards manually.');
    }
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
