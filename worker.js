// Cloudflare Worker for routing probeai.dev/big-brain/* to Big Brain Pages site
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Check if this is a request to probeai.dev/big-brain/*
    if (url.hostname === 'probeai.dev' && url.pathname.startsWith('/big-brain')) {
      // Remove /big-brain from the path and proxy to the Pages site
      const newPath = url.pathname.replace('/big-brain', '') || '/';
      const pagesUrl = `https://3d66f860.big-brain-cyt.pages.dev${newPath}${url.search}`;
      
      // Fetch from the Pages deployment
      const response = await fetch(pagesUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      // Create new response with same content but updated headers
      const newResponse = new Response(response.body, response);
      
      // Update any absolute links in HTML content to include /big-brain prefix
      if (response.headers.get('content-type')?.includes('text/html')) {
        const html = await response.text();
        const updatedHtml = html
          .replace(/href="\//g, 'href="/big-brain/')
          .replace(/src="\//g, 'src="/big-brain/')
          .replace(/url\(\//g, 'url(/big-brain/');
        return new Response(updatedHtml, {
          status: response.status,
          headers: response.headers
        });
      }
      
      return newResponse;
    }
    
    // For any other requests, pass through
    return fetch(request);
  },
};