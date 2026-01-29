import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const KEYCHAIN_SERVICE = 'bourbon-hq-api-keys';

// Get key from Keychain
async function getFromKeychain(id: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`security find-generic-password -s "${KEYCHAIN_SERVICE}" -a "${id}" -w`);
    return stdout.trim();
  } catch {
    return null;
  }
}

// GET - Get full key value (for copying)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (!id) {
    return NextResponse.json(
      { ok: false, error: { message: 'ID required' } },
      { status: 400 }
    );
  }

  const value = await getFromKeychain(id);
  
  if (!value) {
    return NextResponse.json(
      { ok: false, error: { message: 'Key not found' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, value });
}
