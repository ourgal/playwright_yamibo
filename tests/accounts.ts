import fs from 'fs';
import path from 'path';

export type Site = 'yamibo' | 'tsdm' | 'tuiliz';

export type Account = {
  label: string;
  username: string;
  password: string;
  authFile: string;
  hasAuth: boolean;
};

const accountsPath = path.join(import.meta.dirname, '..', 'accounts.json');
const authDir = path.join(import.meta.dirname, '..', 'playwright', '.auth');
const LABEL_PATTERN = /^[A-Za-z0-9._-]+$/;

export function accountsFor(site: Site): Account[] {
  if (!fs.existsSync(accountsPath)) {
    return [];
  }

  let file: unknown;
  try {
    file = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
  } catch (error) {
    throw new Error(`accounts.json is not valid JSON: ${(error as Error).message}`);
  }

  if (typeof file !== 'object' || file === null || Array.isArray(file)) {
    throw new Error('accounts.json must contain an object keyed by site');
  }

  const entries = (file as Record<string, unknown>)[site];
  if (entries === undefined) {
    return [];
  }
  if (!Array.isArray(entries)) {
    throw new Error(`accounts.json: "${site}" must be an array`);
  }

  const seen = new Set<string>();

  return entries.map((entry, index) => {
    const where = `accounts.json: ${site}[${index}]`;
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`${where} must be an object`);
    }

    const { label, username, password } = entry as Record<string, unknown>;
    if (typeof label !== 'string' || !LABEL_PATTERN.test(label)) {
      throw new Error(`${where}.label must be a non-empty string of letters, digits, ".", "_" or "-"`);
    }

    const key = label.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`${where}.label "${label}" is duplicated`);
    }
    seen.add(key);

    if (typeof username !== 'string' || username === '') {
      throw new Error(`${where}.username is required`);
    }
    if (typeof password !== 'string' || password === '') {
      throw new Error(`${where}.password is required`);
    }

    const authFile = path.join(authDir, `${site}-${label}.json`);

    return { label, username, password, authFile, hasAuth: fs.existsSync(authFile) };
  });
}
