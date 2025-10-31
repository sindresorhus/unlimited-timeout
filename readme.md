# unlimited-timeout

> `setTimeout` and `setInterval` that work with delays longer than 24.8 days

JavaScript's built-in `setTimeout` and `setInterval` have a maximum delay of 2^31-1 milliseconds (approximately 24.8 days). Attempting to use a longer delay causes the timer fires immediately with a 1ms delay instead of waiting for the intended duration.

This package provides drop-in replacements that handle arbitrarily long delays by automatically breaking them into smaller chunks.

## Install

```sh
npm install unlimited-timeout
```

## Usage

```js
import {setTimeout, clearTimeout} from 'unlimited-timeout';

// Schedule a callback for 30 days in the future
// With native setTimeout, this would fire immediately and show a warning in Node.js
const timeout = setTimeout(() => {
	console.log('30 days have passed!');
}, 30 * 24 * 60 * 60 * 1000);

// Cancel it if needed
clearTimeout(timeout);
```

```js
import {setInterval, clearInterval} from 'unlimited-timeout';

// Call a function every 30 days
const interval = setInterval(() => {
	console.log('Another 30 days have passed!');
	// Do monthly cleanup, send reports, etc.
}, 30 * 24 * 60 * 60 * 1000);

// Stop it later
clearInterval(interval);
```

## Notes

- The timeout/interval objects returned by this package are not interchangeable with native timeout IDs.
- You must use the `clearTimeout`/`clearInterval` functions from this package, not the native ones.
- For delays under ~24.8 days, this package adds minimal overhead as it doesn't need to chunk.
- This package works in both Node.js and browsers.

## API

### setTimeout(callback, delay, ...arguments)

Schedule a function to be called after a delay, even if the delay exceeds JavaScript's built-in `setTimeout` maximum of ~24.8 days.

Unlike the native `setTimeout`, this function handles arbitrarily long delays by breaking them into smaller chunks internally.

Returns a `Timeout` object that can be passed to `clearTimeout()`.

#### callback

Type: `Function`

The function to call after the delay.

#### delay

Type: `number` (any value will be coerced to number)\
Default: `0`

The delay in milliseconds. Like native `setTimeout`, the value is coerced to a number. Invalid values (NaN, negative numbers) are clamped to `0` (immediate firing). `Infinity` means wait forever (never fire).

#### arguments

Type: `any[]`

Optional arguments to pass to the callback.

```js
import {setTimeout} from 'unlimited-timeout';

// Pass arguments to the callback
setTimeout((name, count) => {
	console.log(`Hello ${name}, called ${count} times`);
}, 1000, 'Alice', 42);
```

### clearTimeout(timeout)

Cancel a timeout created with `setTimeout()`.

This function is safe to call multiple times with the same timeout object, and it's safe to call with `undefined` or `null`.

#### timeout

Type: `Timeout | undefined | null`

The timeout object to cancel.

### setInterval(callback, delay, ...arguments)

Schedule a function to be called repeatedly with a delay between each call, even if the delay exceeds JavaScript's built-in `setInterval` maximum of ~24.8 days.

Unlike the native `setInterval`, this function handles arbitrarily long delays by breaking them into smaller chunks internally.

Returns a `Timeout` object that can be passed to `clearInterval()`.

#### callback

Type: `Function`

The function to call after each delay.

#### delay

Type: `number` (any value will be coerced to number)\
Default: `0`

The delay in milliseconds between each call. Like native `setInterval`, the value is coerced to a number. Invalid values (NaN, negative numbers) are clamped to `0` (immediate firing). `Infinity` means wait forever (never fire).

#### arguments

Type: `any[]`

Optional arguments to pass to the callback.

### clearInterval(interval)

Cancel an interval created with `setInterval()`.

This function is safe to call multiple times with the same interval object, and it's safe to call with `undefined` or `null`.

#### interval

Type: `Timeout | undefined | null`

The interval object to cancel.

### MAX_TIMEOUT

Type: `number`\
Value: `2_147_483_647`

Maximum safe timeout value for `setTimeout` in JavaScript (2^31-1 milliseconds). This is approximately 24.8 days.

## Related

- [delay](https://github.com/sindresorhus/delay) - Delay a promise a specified amount of time
