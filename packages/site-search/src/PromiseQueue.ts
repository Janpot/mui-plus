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
  private _queue: Task<any>[];

  constructor({ concurrency = 1 }: QueueOptions = {}) {
    this._concurrency = concurrency;
    this._pending = 0;
    this._queue = [];
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
