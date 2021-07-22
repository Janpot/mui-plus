import handler from 'site-search/handler';
const { pathname: indexFile } = new URL(
  '../../site-search.json?localFile',
  import.meta.url
);
export default handler({ filename: indexFile });
