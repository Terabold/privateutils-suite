/* eslint-disable no-restricted-globals */

self.onmessage = async (e: MessageEvent) => {
  const { buffer, algorithms } = e.data;
  
  if (!buffer || !algorithms) {
    self.postMessage({ error: "Invalid data payload." });
    return;
  }

  try {
    const results: Record<string, string> = {};
    
    // Process each algorithm
    // SubtleCrypto.digest takes a buffer and returns a promise.
    // It does not consume the buffer, so we can reuse it.
    for (const algo of algorithms) {
      const hashBuffer = await crypto.subtle.digest(algo, buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      results[algo] = hashHex;
    }

    self.postMessage({ results });
  } catch (err: any) {
    self.postMessage({ error: err.message || "Worker cryptographic failure." });
  }
};
