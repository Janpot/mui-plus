import * as sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { resolve } from 'path';
import { IncomingMessage, ServerResponse } from 'http';

const projectRoot = process.cwd();

const indexPath = resolve(projectRoot, 'site-search.db');

let db: Database<sqlite3.Database, sqlite3.Statement>;

async function getDb() {
  if (!db) {
    db = await open({
      filename: indexPath,
      driver: sqlite3.Database,
    });
  }
  return db;
}

export default function () {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const db = await getDb();
    const { searchParams } = new URL(req.url!, 'http://x');
    const query = searchParams.get('q');
    const results = await db.all(
      `
      SELECT * FROM site_search_index WHERE site_search_index MATCH ?;
    `,
      query
    );
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ results }));
  };
}
