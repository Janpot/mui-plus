import * as React from 'react';

const noop = () => undefined;

export type UseControlled<T> = [T, (value: T) => void];

let didWarnControlled = false;

export function useControlled<T>(
  name: string,
  value: T | undefined,
  onChange: ((value: T) => void) | undefined,
  defaultValue: T
): UseControlled<T>;
export function useControlled<T>(
  name: string,
  value: T | undefined,
  onChange: ((value: T | undefined) => void) | undefined,
  defaultValue: T | undefined
): UseControlled<T | undefined> {
  const { current: isControlled } = React.useRef(typeof value !== 'undefined');
  const uncontrolledState = React.useState(defaultValue);

  if (process.env.NODE_ENV !== 'production') {
    if (isControlled && typeof onChange === 'undefined' && !didWarnControlled) {
      console.error(
        `a controlled prop ${name} is missing a corresponding onChange handler`
      );
      didWarnControlled = true;
    }

    if (isControlled !== (typeof value !== 'undefined')) {
      console.error(
        `a ${
          isControlled ? 'controlled' : 'uncontrolled'
        } prop ${name} is changing to an ${
          isControlled ? 'uncontrolled' : 'controlled'
        } prop.`
      );
      didWarnControlled = true;
    }
  }

  return isControlled ? [value, onChange || noop] : uncontrolledState;
}
