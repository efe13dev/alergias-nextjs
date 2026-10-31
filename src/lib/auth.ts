export async function isAuthorized(header: string | null, password: string | undefined) {
  if (process.env.NODE_ENV === "development") return true;

  if (!password || !/^[\x21-\x7e]{32,}$/.test(password) || !header?.startsWith("Basic ")) {
    return false;
  }

  try {
    const credentials = atob(header.slice(6));
    const expected = `usuario:${password}`;
    const encoder = new TextEncoder();
    const [actualHash, expectedHash] = await Promise.all([
      crypto.subtle.digest("SHA-256", encoder.encode(credentials)),
      crypto.subtle.digest("SHA-256", encoder.encode(expected)),
    ]);
    const actual = new Uint8Array(actualHash);
    const target = new Uint8Array(expectedHash);
    return actual.reduce((difference, byte, index) => difference | (byte ^ target[index]), 0) === 0;
  } catch {
    return false;
  }
}
