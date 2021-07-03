import handler from 'site-search/handler';
// This doesn't work anymore in latest Next.js
// const indexFile = new URL('../../site-search.json', import.meta.url).pathname;
const indexFile = './site-search.json';
export default handler({ filename: indexFile });
