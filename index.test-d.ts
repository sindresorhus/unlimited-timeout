/* eslint-disable @typescript-eslint/no-empty-function -- The tsd cases are about the call signatures, so the callbacks are intentionally empty. */
import {expectTypeOf} from 'nz';
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
expectTypeOf(MAX_TIMEOUT).toBe<2147483647>();

// SetTimeout
const timeout = setTimeout(() => {}, 1000);
expectTypeOf(timeout).toBe<Timeout>();
expectTypeOf(timeout.id).toBe<TimerHandle | undefined>();
expectTypeOf(timeout.cleared).toBe<boolean>();
expectTypeOf(timeout.ref()).toBe<Timeout>();
expectTypeOf(timeout.unref()).toBe<Timeout>();

// SetTimeout with arguments
expectTypeOf(setTimeout((name: string, count: number) => {}, 1000, 'test', 42)).toBe<Timeout>();

// SetTimeout without delay
expectTypeOf(setTimeout(() => {})).toBe<Timeout>();

// SetTimeout with long delay
expectTypeOf(setTimeout(() => {}, 30 * 24 * 60 * 60 * 1000)).toBe<Timeout>();

// SetTimeout with Infinity
expectTypeOf(setTimeout(() => {}, Infinity)).toBe<Timeout>();

// ClearTimeout
clearTimeout(timeout);
clearTimeout(undefined);
clearTimeout(null);

// SetInterval
const interval = setInterval(() => {}, 1000);
expectTypeOf(interval).toBe<Timeout>();
expectTypeOf(interval.id).toBe<TimerHandle | undefined>();
expectTypeOf(interval.cleared).toBe<boolean>();
expectTypeOf(interval.ref()).toBe<Timeout>();
expectTypeOf(interval.unref()).toBe<Timeout>();

// SetInterval with arguments
expectTypeOf(setInterval((message: string, isEnabled: boolean) => {}, 1000, 'test', true)).toBe<Timeout>();

// SetInterval without delay
expectTypeOf(setInterval(() => {})).toBe<Timeout>();

// SetInterval with long delay
expectTypeOf(setInterval(() => {}, 30 * 24 * 60 * 60 * 1000)).toBe<Timeout>();

// SetInterval with Infinity
expectTypeOf(setInterval(() => {}, Infinity)).toBe<Timeout>();

// ClearInterval
clearInterval(interval);
clearInterval(undefined);
clearInterval(null);
