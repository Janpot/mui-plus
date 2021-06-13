import { parsePages, findRelativePages } from './siteStructure';

test('ignores api routes', () => {
  const structure = parsePages([
    {
      name: 'api',
      children: [
        {
          name: 'search',
          route: '/api/search',
        },
      ],
      route: '/api',
    },
  ]);

  expect(structure).toHaveLength(0);
});

test('ignores internal pages', () => {
  const structure = parsePages([
    {
      name: '_app',
      route: '/_app',
    },
    {
      name: '_document',
      route: '/_document',
    },
  ]);

  expect(structure).toHaveLength(0);
});

test('simple pages', () => {
  const structure = parsePages([
    {
      name: 'index',
      route: '/',
    },
    {
      name: 'foo',
      children: [
        {
          name: 'bar',
          route: '/foo/bar',
        },
        {
          name: 'baz',
          route: '/foo/baz',
        },
      ],
      route: '/foo',
    },
    {
      name: 'bar',
      route: '/bar',
    },
  ]);
  expect(structure).toEqual([
    expect.objectContaining({
      name: 'index',
      title: 'index',
      route: '/',
      children: [],
    }),
    expect.objectContaining({
      name: 'foo',
      title: 'foo',
      route: '/foo',
      children: [
        expect.objectContaining({
          name: 'bar',
          title: 'bar',
          route: '/foo/bar',
          children: [],
        }),
        expect.objectContaining({
          name: 'baz',
          title: 'baz',
          route: '/foo/baz',
          children: [],
        }),
      ],
    }),
    expect.objectContaining({
      name: 'bar',
      title: 'bar',
      route: '/bar',
      children: [],
    }),
  ]);
});

test('add custom titles', () => {
  const structure = parsePages([
    {
      name: 'index',
      route: '/',
      frontMatter: {
        title: 'Custom Title',
      },
    },
    {
      name: 'foo',
      route: '/foo',
      frontMatter: {
        title: 'Another Custom Title',
      },
    },
  ]);
  expect(structure).toEqual([
    expect.objectContaining({
      name: 'index',
      title: 'Custom Title',
    }),
    expect.objectContaining({
      name: 'foo',
      title: 'Another Custom Title',
    }),
  ]);
});

test('custom pages order', () => {
  const structure = parsePages([
    {
      name: 'index',
      route: '/',
      frontMatter: {
        order: [
          'bar',
          {
            name: 'index',
            title: 'The Index',
          },
          {
            name: 'foo',
          },
        ],
      },
    },
    {
      name: 'foo',
      route: '/foo',
    },
    {
      name: 'bar',
      route: '/bar',
    },
  ]);
  expect(structure).toEqual([
    expect.objectContaining({
      name: 'bar',
    }),
    expect.objectContaining({
      name: 'index',
    }),
    expect.objectContaining({
      name: 'foo',
    }),
  ]);
});

test('non-existing page in order', () => {
  expect(() => {
    parsePages([
      {
        name: 'index',
        route: '/',
        frontMatter: {
          order: ['foo', 'index'],
        },
      },
    ]);
  }).toThrowError(
    'Custom order has an entry "foo" for which a page can\'t be found'
  );
});

describe('active route', () => {
  const structure = parsePages([
    {
      name: 'index',
      route: '/',
    },
    {
      name: 'foo',
      children: [
        {
          name: 'bar',
          route: '/foo/bar',
        },
        {
          name: 'baz',
          route: '/foo/baz',
        },
      ],
      route: '/foo',
    },
    {
      name: 'bar',
      children: [
        {
          name: 'index',
          route: '/bar',
        },
        {
          name: 'baz',
          route: '/bar/baz',
        },
        {
          name: 'quux',
          route: '/bar/quux',
        },
      ],
      route: '/bar',
    },
  ]);

  test('active route "/"', () => {
    const relatives = findRelativePages(structure, '/');
    expect(relatives).toEqual(
      expect.objectContaining({
        current: [structure[0]],
        prev: null,
        next: structure[1],
      })
    );
  });

  test('active route "/foo"', () => {
    const relatives = findRelativePages(structure, '/foo');
    expect(relatives).toEqual(
      expect.objectContaining({
        current: [structure[1]],
        prev: structure[0],
        next: structure[2],
      })
    );
  });

  test('active route "/foo/baz"', () => {
    const relatives = findRelativePages(structure, '/foo/baz');
    expect(relatives).toEqual(
      expect.objectContaining({
        current: [structure[1], structure[1].children[1]],
        prev: structure[1].children[0],
        next: null,
      })
    );
  });

  test('active route "/bar"', () => {
    const relatives = findRelativePages(structure, '/bar');
    expect(relatives).toEqual(
      expect.objectContaining({
        current: [structure[2], structure[2].children[0]],
        prev: null,
        next: structure[2].children[1],
      })
    );
  });

  test('active route "/bar/baz"', () => {
    const relatives = findRelativePages(structure, '/bar/baz');
    expect(relatives).toEqual(
      expect.objectContaining({
        current: [structure[2], structure[2].children[1]],
        prev: structure[2].children[0],
        next: structure[2].children[2],
      })
    );
  });
});
