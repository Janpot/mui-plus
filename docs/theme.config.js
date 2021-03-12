export default {
  repository: 'https://github.com/janpot/mui-plus', // project repo
  docsRepository: 'https://github.com/janpot/mui-plus', // docs repo
  branch: 'main', // branch of docs
  path: '/', // path of docs
  titleSuffix: ' – Mui+',
  nextLinks: true,
  prevLinks: true,
  search: true,
  customSearch: null, // customizable, you can use algolia for example
  darkMode: true,
  footer: true,
  footerText: 'MIT 2020 © Jan Potoms.',
  footerEditOnGitHubLink: true, // will link to the docs repo
  logo: (
    <>
      <span>Mui+</span>
    </>
  ),
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Mui+: extensions for Material UI" />
      <meta name="og:title" content="Mui+: extensions for Material UI" />
    </>
  ),
};
