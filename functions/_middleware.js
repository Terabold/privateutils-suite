export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // 1. Check if the path ends with a slash and is not just the root "/"
  // We use url.pathname.length > 1 to ensure we don't redirect the homepage itself
  if (url.pathname.endsWith('/') && url.pathname.length > 1) {
    const newUrl = new URL(context.request.url);
    
    // Remove the trailing slash
    newUrl.pathname = url.pathname.slice(0, -1);
    
    // Use 308 Permanent Redirect (preferred for SEO as it preserves the request method)
    // The "location" header will be set to the non-slash version
    return Response.redirect(newUrl.toString(), 308);
  }
  
  // If no trailing slash (or it's the root), continue to the next middleware or asset
  return context.next();
}
