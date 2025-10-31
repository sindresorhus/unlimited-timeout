/* eslint-disable @typescript-eslint/no-empty-function */
import {expectType} from 'tsd';
import {
	setTimeout,
	clearTimeout,
	setInterval,
	clearInterval,
	MAX_TIMEOUT,
	type Timeout,
	type TimerHandle,
} from './index.js';

// eslint-disable-next-line unicorn/numeric-separators-style
expectType<2147483647>(MAX_TIMEOUT);

// SetTimeout
const timeout = setTimeout(() => {}, 1000);
expectType<Timeout>(timeout);
expectType<TimerHandle | undefined>(timeout.id);
expectType<boolean>(timeout.cleared);
expectType<Timeout>(timeout.ref());
expectType<Timeout>(timeout.unref());

// SetTimeout with arguments
expectType<Timeout>(setTimeout((name: string, count: number) => {}, 1000, 'test', 42));

// SetTimeout without delay
expectType<Timeout>(setTimeout(() => {}));

// SetTimeout with long delay
expectType<Timeout>(setTimeout(() => {}, 30 * 24 * 60 * 60 * 1000));

// SetTimeout with Infinity
expectType<Timeout>(setTimeout(() => {}, Infinity));

// ClearTimeout
clearTimeout(timeout);
clearTimeout(undefined);
clearTimeout(null);

// SetInterval
const interval = setInterval(() => {}, 1000);
expectType<Timeout>(interval);
expectType<TimerHandle | undefined>(interval.id);
expectType<boolean>(interval.cleared);
expectType<Timeout>(interval.ref());
expectType<Timeout>(interval.unref());

// SetInterval with arguments
expectType<Timeout>(setInterval((message: string, enabled: boolean) => {}, 1000, 'test', true));

// SetInterval without delay
expectType<Timeout>(setInterval(() => {}));

// SetInterval with long delay
expectType<Timeout>(setInterval(() => {}, 30 * 24 * 60 * 60 * 1000));

// SetInterval with Infinity
expectType<Timeout>(setInterval(() => {}, Infinity));

// ClearInterval
clearInterval(interval);
clearInterval(undefined);
clearInterval(null);
