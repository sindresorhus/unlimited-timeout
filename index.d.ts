/**
Maximum safe timeout value for `setTimeout` in JavaScript (2^31-1 milliseconds). This is approximately 24.8 days.
*/
// eslint-disable-next-line @typescript-eslint/naming-convention, unicorn/numeric-separators-style
export const MAX_TIMEOUT: 2147483647;

/**
Cross-environment timer handle (works in both Node.js and browsers).
*/
export type TimerHandle = ReturnType<typeof globalThis.setTimeout>;

/**
Timeout object that can be cleared.
*/
export type Timeout = {
	id: TimerHandle | undefined;
	cleared: boolean;

	/**
	Prevents the event loop from exiting while this timer is active (Node.js only; no-op in browsers).

	@returns The timeout object for chaining.
	*/
	ref(): Timeout;

	/**
	Allows the event loop to exit if this is the only active timer (Node.js only; no-op in browsers).

	@returns The timeout object for chaining.
	*/
	unref(): Timeout;
};

/**
Schedule a function to be called after a delay, even if the delay exceeds JavaScript's built-in `setTimeout` maximum of ~24.8 days.

Unlike the native `setTimeout`, this function handles arbitrarily long delays by breaking them into smaller chunks internally.

@param callback - The function to call after the delay.
@param delay - The delay in milliseconds. Like native `setTimeout`, the value is coerced to a number. Invalid values (NaN, negative numbers) are clamped to `0` (immediate firing). `Infinity` means wait forever (never fire).
@param arguments_ - Optional arguments to pass to the callback.
@returns A timeout object that can be passed to `clearTimeout()`.

@example
```
import {setTimeout, clearTimeout} from 'unlimited-timeout';

// Schedule a callback for 30 days in the future
const timeout = setTimeout(() => {
	console.log('30 days have passed!');
}, 30 * 24 * 60 * 60 * 1000);

// Cancel it if needed
clearTimeout(timeout);
```

@example
```
import {setTimeout} from 'unlimited-timeout';

// Pass arguments to the callback
const timeout = setTimeout((name, count) => {
	console.log(`Hello ${name}, called ${count} times`);
}, 1000, 'Alice', 42);
```
*/
export function setTimeout<Arguments extends unknown[]>(
	callback: (...arguments_: Arguments) => void,
	delay?: number,
	...arguments_: Arguments
): Timeout;

/**
Cancel a timeout created with `setTimeout()`.

This function is safe to call multiple times with the same timeout object, and it's safe to call with `undefined` or `null`.

@param timeout - The timeout object to cancel.

@example
```
import {setTimeout, clearTimeout} from 'unlimited-timeout';

const timeout = setTimeout(() => {
	console.log('This will not be logged');
}, 1000);

clearTimeout(timeout);
```
*/
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export function clearTimeout(timeout: Timeout | undefined | null): void;

/**
Schedule a function to be called repeatedly with a delay between each call, even if the delay exceeds JavaScript's built-in `setInterval` maximum of ~24.8 days.

Unlike the native `setInterval`, this function handles arbitrarily long delays by breaking them into smaller chunks internally.

@param callback - The function to call after each delay.
@param delay - The delay in milliseconds between each call. Like native `setInterval`, the value is coerced to a number. Invalid values (NaN, negative numbers) are clamped to `0` (immediate firing). `Infinity` means wait forever (never fire).
@param arguments_ - Optional arguments to pass to the callback.
@returns An interval object that can be passed to `clearInterval()`.

@example
```
import {setInterval, clearInterval} from 'unlimited-timeout';

// Call a function every 30 days
const interval = setInterval(() => {
	console.log('Another 30 days have passed!');
}, 30 * 24 * 60 * 60 * 1000);

// Cancel it when done
clearInterval(interval);
```

@example
```
import {setInterval} from 'unlimited-timeout';

// Pass arguments to the callback
const interval = setInterval((message) => {
	console.log(message);
}, 5000, 'Still running...');
```
*/
export function setInterval<Arguments extends unknown[]>(
	callback: (...arguments_: Arguments) => void,
	delay?: number,
	...arguments_: Arguments
): Timeout;

/**
Cancel an interval created with `setInterval()`.

This function is safe to call multiple times with the same interval object, and it's safe to call with `undefined` or `null`.

@param interval - The interval object to cancel.

@example
```
import {setInterval, clearInterval} from 'unlimited-timeout';

const interval = setInterval(() => {
	console.log('This will not be logged');
}, 1000);

clearInterval(interval);
```
*/
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export function clearInterval(interval: Timeout | undefined | null): void;
