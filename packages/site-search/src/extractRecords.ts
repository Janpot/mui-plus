import { ContentSelectors, IndexedRecord, Level } from './types';

const levels: Level[] = [
  'lvl0',
  'lvl1',
  'lvl2',
  'lvl3',
  'lvl4',
  'lvl5',
  'text',
];

function innerText(elm: Element) {
  const clone = elm.cloneNode(true) as Element;
  clone.querySelectorAll('script,style').forEach((tag) => tag.remove());
  return clone.textContent;
}

function walk(elm: Element, visitor: (elm: Element) => boolean) {
  const walkChildren = visitor(elm);
  if (walkChildren) {
    for (const child of elm.children) {
      walk(child, visitor);
    }
  }
}

function getLevel(elm: Element, selectors: ContentSelectors): Level | null {
  for (const level of levels) {
    if (elm.matches(selectors[level])) {
      return level;
    }
  }
  return null;
}

function getOwnAnchor(elm: Element) {
  return elm.id || elm.getAttribute('name');
}

function getAnchor(elm: Element) {
  const ownAnchor = getOwnAnchor(elm);
  if (ownAnchor) {
    return ownAnchor;
  }
  const childWithAnchor = elm.querySelector('[id], [name]');
  return childWithAnchor ? getOwnAnchor(childWithAnchor) : null;
}

export default function extractRecords(
  root: HTMLElement,
  selectors: ContentSelectors
): IndexedRecord[] {
  const result: IndexedRecord[] = [];
  const current: IndexedRecord = {};
  let currentLevel: Level | null = null;

  walk(root, (elm) => {
    const level = getLevel(elm, selectors);
    const content = innerText(elm);
    const anchor = getAnchor(elm);
    if (!level || !content) {
      return true;
    } else if (level === 'text') {
      current.text = (current.text ? current.text + '\n' : '') + content.trim();
    } else if (currentLevel) {
      const currentLevelIndex = levels.indexOf(currentLevel);
      const newLevelIndex = levels.indexOf(level);
      if (!current.text && currentLevelIndex < newLevelIndex) {
        currentLevel = level;
        current[level] = content;
      } else {
        if (current.text) {
          result.push({ ...current });
        }
        for (const removeLevel of levels.slice(newLevelIndex, levels.length)) {
          delete current[removeLevel];
        }
        current[level] = content;
      }
      if (anchor) {
        current.anchor = anchor;
      }
    } else if (level) {
      currentLevel = level;
      current[level] = content;
      if (anchor) {
        current.anchor = anchor;
      }
    }
    return false;
  });

  if (current.text) {
    result.push({ ...current });
  }

  return result;
}
