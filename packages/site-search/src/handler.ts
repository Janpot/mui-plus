import lunr from 'lunr';
import { IncomingMessage, ServerResponse } from 'http';
import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
import { IndexedDocument } from './types';

const ajv = new Ajv();

const indexSchema: JTDSchemaType<IndexedDocument[]> = {
  elements: {
    properties: {
      path: { type: 'string' },
    },
    optionalProperties: {
      lvl0: { type: 'string' },
      lvl1: { type: 'string' },
      lvl2: { type: 'string' },
      lvl3: { type: 'string' },
      lvl4: { type: 'string' },
      lvl5: { type: 'string' },
      text: { type: 'string' },
      path: { type: 'string' },
      anchor: { type: 'string' },
    },
  },
};

const validateDocuments = ajv.compile(indexSchema);

async function getData(input: unknown) {
  if (typeof input !== 'object' || !input) {
    throw new Error('Invalid index');
  }

  const { corpus, index } = input as any;

  if (!validateDocuments(corpus)) {
    throw new Error(ajv.errorsText(validateDocuments.errors));
  }

  return {
    corpus,
    index: lunr.Index.load(index),
  };
}

async function search(input: unknown, query: string) {
  const { corpus, index } = await getData(input);

  const results = index.search(query);
  return results.slice(0, 10).map((result) => {
    console.log(result.matchData.metadata);
    return {
      doc: corpus[Number(result.ref)],
      score: result.score,
    };
  });
}

export default function (input: unknown) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const { searchParams } = new URL(req.url!, 'http://x');
    const query = searchParams.get('q');
    const results = query ? await search(input, query) : [];
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ results }));
  };
}
