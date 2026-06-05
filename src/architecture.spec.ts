import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function filesUnder(path: string): string[] {
  return readdirSync(path).flatMap((entry) => {
    const fullPath = join(path, entry);
    return statSync(fullPath).isDirectory() ? filesUnder(fullPath) : [fullPath];
  });
}

describe('architecture', () => {
  it('keeps HTTP clients isolated in shared clients infrastructure', () => {
    const clientFiles = filesUnder(join('src', 'shared', 'clients')).filter((file) => file.endsWith('.ts'));
    expect(clientFiles.length).toBeGreaterThan(0);

    for (const file of filesUnder('src').filter((item) => item.endsWith('.ts') && !item.endsWith('.spec.ts'))) {
      const source = readFileSync(file, 'utf8');
      if (!file.includes(join('shared', 'clients')) && !file.includes(join('shared', 'http'))) {
        expect(source, relative(process.cwd(), file)).not.toMatch(/extends HttpClient/);
      }
    }
  });

  it('keeps raw fetch usage inside the shared HTTP adapter', () => {
    for (const file of filesUnder('src').filter((item) => item.endsWith('.ts') && !item.endsWith('.spec.ts'))) {
      const source = readFileSync(file, 'utf8');
      if (!file.includes(join('shared', 'http'))) {
        expect(source, relative(process.cwd(), file)).not.toMatch(/\bfetch\s*\(/);
      }
    }
  });

  it('exposes the required aggregated-data endpoint through the BFF', () => {
    const source = readFileSync(join('src', 'aggregated-data', 'aggregated-data.controller.ts'), 'utf8');

    expect(source).toMatch(/@Controller\('aggregated-data'\)/);
    expect(source).toMatch(/@Get\(\)/);
  });
});
