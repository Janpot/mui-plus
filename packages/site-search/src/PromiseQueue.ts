type Node<T> = [T, Node<T> | null];

class List<T> {
  private _head: Node<T> | null = null;
  private _tail: Node<T> | null = null;
  private _length: number = 0;

  get length() {
    return this._length;
  }

  push(value: T) {
    const newNode: Node<T> = [value, null];
    if (this._tail) {
      this._tail[1] = newNode;
      this._tail = newNode;
    } else {
      this._head = newNode;
      this._tail = newNode;
    }
    this._length += 1;
  }

  shift(): T | undefined {
    if (this._head) {
      const result = this._head[0];
      this._head = this._head[1];
      if (!this._head) {
        this._tail = null;
      }
      this._length -= 1;
      return result;
    } else {
      return undefined;
    }
  }
}

export interface QueueOptions {
  concurrency?: number;
}

export interface Task<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  job: () => Promise<T>;
}

export default class PromiseQueue {
  private _concurrency: number;
  private _pending: number;
  private _queue: List<Task<any>>;

  constructor({ concurrency = 1 }: QueueOptions = {}) {
    this._concurrency = concurrency;
    this._pending = 0;
    this._queue = new List();
  }

  private _tryNext() {
    if (this._queue.length <= 0 || this._pending >= this._concurrency) {
      return;
    }
    const { job, resolve, reject } = this._queue.shift() as Task<any>;
    this._pending++;
    job()
      .then(resolve, reject)
      .finally(() => {
        this._pending--;
        this._tryNext();
      });
    this._tryNext();
  }

  add<T>(job: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this._queue.push({
        resolve,
        reject,
        job,
      });
      this._tryNext();
    });
  }
}
