import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Next 설정에 GitHub Pages 전용 경로가 없다', async () => {
  const source = await readFile(new URL('../next.config.mjs', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /basePath|assetPrefix|output:\s*['"]export/);
});

test('GitHub Pages 워크플로가 제거되었다', async () => {
  await assert.rejects(
    () => readFile(new URL('../.github/workflows/deploy-github-pages.yml', import.meta.url)),
    /ENOENT/,
  );
});
