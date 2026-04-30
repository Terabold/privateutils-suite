// Simulate SSR environment
if (typeof document === 'undefined') {
  console.log('document is undefined in Node.js - good');
} else {
  console.log('document exists:', typeof document);
}

// Check if the useState initializer would throw
try {
  const result = (() => {
    // This is what PasswordGenerator does:
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  })();
  console.log('Safe check result:', result);
} catch(e) {
  console.log('Error:', e.message);
}
