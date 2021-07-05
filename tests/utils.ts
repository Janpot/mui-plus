import * as esbuild from 'esbuild';

export async function bundle(examplePath: string) {
  const bundle = await esbuild.build({
    bundle: true,
    write: false,
    target: 'es6',
    minify: true,
    define: {
      'process.env.NODE_ENV': "'production'",
    },
    stdin: {
      loader: 'tsx',
      resolveDir: process.cwd(),
      sourcefile: 'main.tsx',
      contents: `
        import * as ReactDOM from 'react-dom'
        import * as React from 'react';
        import {CssBaseline} from '@material-ui/core';
        import Component from '${examplePath}';
        async function main () {
          await document.fonts.ready;
          const container = document.getElementById('container')
          await new Promise(resolve => ReactDOM.render(<>
            <CssBaseline />
            <Component />
          </>, container, resolve));
          window.__ready = true;
        }
        main();
      `,
    },
  });
  const script = bundle.outputFiles[0].text;
  return `
    <html>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700"
        />
      </head>
      <body>
        <div style="padding:24px" id="container"></div>
        <script>
          ${script}
        </script>
      </body>
    </html>
  `;
}
