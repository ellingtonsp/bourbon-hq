import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const KEYCHAIN_SERVICE = 'bourbon-hq-api-keys';

interface StoredKey {
  id: string;
  name: string;
  service: string;
  createdAt: string;
}

// Get all stored keys (metadata only, not values)
async function getStoredKeys(): Promise<StoredKey[]> {
  try {
    // Read keys index from a local file
    const { stdout } = await execAsync(`cat ~/.bourbon-hq-keys.json 2>/dev/null || echo "[]"`);
    return JSON.parse(stdout.trim());
  } catch {
    return [];
  }
}

// Save keys index
async function saveStoredKeys(keys: StoredKey[]): Promise<void> {
  const json = JSON.stringify(keys, null, 2);
  await execAsync(`echo '${json.replace(/'/g, "'\\''")}' > ~/.bourbon-hq-keys.json`);
}

// Store key in macOS Keychain
async function storeInKeychain(id: string, value: string): Promise<boolean> {
  try {
    // Delete existing if present
    await execAsync(`security delete-generic-password -s "${KEYCHAIN_SERVICE}" -a "${id}" 2>/dev/null || true`);
    // Add new
    await execAsync(`security add-generic-password -s "${KEYCHAIN_SERVICE}" -a "${id}" -w "${value}"`);
    return true;
  } catch (err) {
    console.error('Keychain store error:', err);
    return false;
  }
}

// Get key from Keychain
async function getFromKeychain(id: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`security find-generic-password -s "${KEYCHAIN_SERVICE}" -a "${id}" -w`);
    return stdout.trim();
  } catch {
    return null;
  }
}

// Delete from Keychain
async function deleteFromKeychain(id: string): Promise<boolean> {
  try {
    await execAsync(`security delete-generic-password -s "${KEYCHAIN_SERVICE}" -a "${id}"`);
    return true;
  } catch {
    return false;
  }
}

// Mask an API key for display
function maskKey(value: string): string {
  if (value.length <= 8) return '••••••••';
  return value.slice(0, 4) + '••••••••' + value.slice(-4);
}

// GET - List all keys (masked)
export async function GET() {
  const storedKeys = await getStoredKeys();
  
  const keys = await Promise.all(
    storedKeys.map(async (key) => {
      const value = await getFromKeychain(key.id);
      return {
        id: key.id,
        name: key.name,
        service: key.service,
        maskedValue: value ? maskKey(value) : '(not found)',
        location: 'keychain' as const,
        createdAt: key.createdAt,
      };
    })
  );

  return NextResponse.json({ ok: true, keys });
}

// POST - Add a new key
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, service, value } = body;

  if (!name || !service || !value) {
    return NextResponse.json(
      { ok: false, error: { message: 'Name, service, and value required' } },
      { status: 400 }
    );
  }

  const id = `${service}-${Date.now()}`;
  
  // Store in keychain
  const stored = await storeInKeychain(id, value);
  if (!stored) {
    return NextResponse.json(
      { ok: false, error: { message: 'Failed to store in keychain' } },
      { status: 500 }
    );
  }

  // Update index
  const keys = await getStoredKeys();
  keys.push({ id, name, service, createdAt: new Date().toISOString() });
  await saveStoredKeys(keys);

  return NextResponse.json({ ok: true, id });
}

// DELETE - Remove a key
export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { ok: false, error: { message: 'ID required' } },
      { status: 400 }
    );
  }

  // Delete from keychain
  await deleteFromKeychain(id);

  // Update index
  const keys = await getStoredKeys();
  const filtered = keys.filter((k) => k.id !== id);
  await saveStoredKeys(filtered);

  return NextResponse.json({ ok: true });
}
