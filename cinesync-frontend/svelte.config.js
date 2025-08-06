import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    // Configure adapter for static site generation (GitHub Pages)
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false
    }),
    // You can add this to support GitHub Pages path structure
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/cinesync' : ''
    },
    prerender: {
      default: true
    }
  }
};

export default config;