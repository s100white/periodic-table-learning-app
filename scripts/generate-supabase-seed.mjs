import { writeFile } from 'node:fs/promises';
import { fallbackComparisonNotes, fallbackElements } from '../src/data/fallback-elements.mjs';
import { createSeedSql, validateSeedData } from '../src/lib/seed-sql.mjs';

validateSeedData(fallbackElements, fallbackComparisonNotes);

await writeFile(
  new URL('../supabase/migrations/202609150002_seed_periodic_table.sql', import.meta.url),
  createSeedSql(fallbackElements, fallbackComparisonNotes),
  'utf8',
);
