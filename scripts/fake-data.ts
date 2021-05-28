#!/usr/bin/env ts-node-script

import { resolve } from 'path';
import { writeFile, rm, mkdir } from 'fs/promises';
import { format } from 'prettier';
import * as faker from 'faker';

const ROOT = resolve(__dirname, '..');

const OUTPUT_FOLDER = resolve(ROOT, './docs/examples/data/');

const SIZES = [10, 25, 100];

async function main() {
  await rm(OUTPUT_FOLDER, { recursive: true, force: true });
  await mkdir(OUTPUT_FOLDER);

  await Promise.all(
    SIZES.map(async (size) => {
      const jsonFilepath = resolve(OUTPUT_FOLDER, `people-${size}.json`);

      const people = [];

      for (let i = 0; i < size; i++) {
        people.push({
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          address: faker.address.streetAddress(),
          birthDate: faker.date.past(90),
          email: faker.internet.email(),
          userName: faker.internet.userName(),
          phone: faker.phone.phoneNumber(),
        });
      }

      const json = format(JSON.stringify(people), {
        filepath: jsonFilepath,
      });

      await writeFile(jsonFilepath, json, { encoding: 'utf-8' });
    })
  );
}

main();

export {};
