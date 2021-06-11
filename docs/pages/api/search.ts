import handler from 'site-search/handler';
const indexFileUrl = new URL('../../site-search.json', import.meta.url);
export default handler({ filename: indexFileUrl.pathname });
