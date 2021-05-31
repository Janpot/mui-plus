import { JSDOM } from 'jsdom';
import extractRecords from './extractRecords';

test('Basic text extraction', () => {
  const { window } = new JSDOM(`
    <section>
      <h1>Main Title</h1>
      <h2>Some Subtitle</h2>
      <p>Some content</p>
      <p>Some content as well</p>
      <h2>Some other Subtitle</h2>
      <p>Some more content</p>
      <h3>Such a deep title</h3>
      <p>And such deep content</p>
      <h2>Back up again</h2>
      <p>The end</p>
    </section>
  `);

  const records = extractRecords(window.document.body, {
    lvl0: 'section h1',
    lvl1: 'section h2',
    lvl2: 'section h3',
    lvl3: 'section h4',
    lvl4: 'section h5',
    lvl5: 'section h6',
    text: 'section p',
  });

  expect(records).toEqual([
    {
      lvl0: 'Main Title',
      lvl1: 'Some Subtitle',
      text: 'Some content\nSome content as well',
    },
    {
      lvl0: 'Main Title',
      lvl1: 'Some other Subtitle',
      text: 'Some more content',
    },
    {
      lvl0: 'Main Title',
      lvl1: 'Some other Subtitle',
      lvl2: 'Such a deep title',
      text: 'And such deep content',
    },
    { lvl0: 'Main Title', lvl1: 'Back up again', text: 'The end' },
  ]);
});

test("Doesn't find things outside of selectors", () => {
  const { window } = new JSDOM(`
    <body>
      <h1>Ignore this</h1>
      <p>And this</p>
      <section>
        <h1>Some Title</h1>
        <p>Some content</p>
      </section>
      <h2>Ignore also this</h2>
      <p>And this too</p>
    </body>
  `);

  const records = extractRecords(window.document.body, {
    lvl0: 'section h1',
    lvl1: 'section h2',
    lvl2: 'section h3',
    lvl3: 'section h4',
    lvl4: 'section h5',
    lvl5: 'section h6',
    text: 'section p',
  });

  expect(records).toEqual([
    {
      lvl0: 'Some Title',
      text: 'Some content',
    },
  ]);
});

test('Understands anchors', () => {
  const { window } = new JSDOM(`
    <section>
      <h1>Main Title</h1>
      <h2 id="anchor1">Some Subtitle</h2>
      <p>Some content</p>
      <h2>Some other Subtitle<span id="anchor2"/></h2>
      <p>Some more content</p>
    </section>
  `);

  const records = extractRecords(window.document.body, {
    lvl0: 'section h1',
    lvl1: 'section h2',
    lvl2: 'section h3',
    lvl3: 'section h4',
    lvl4: 'section h5',
    lvl5: 'section h6',
    text: 'section p',
  });

  expect(records).toEqual([
    {
      lvl0: 'Main Title',
      lvl1: 'Some Subtitle',
      anchor: 'anchor1',
      text: 'Some content',
    },
    {
      lvl0: 'Main Title',
      anchor: 'anchor2',
      lvl1: 'Some other Subtitle',
      text: 'Some more content',
    },
  ]);
});
