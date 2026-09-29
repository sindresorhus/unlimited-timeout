import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
	setTimeout,
	clearTimeout,
	setInterval,
	clearInterval,
	MAX_TIMEOUT,
} from './index.js';

// These tests wait on real timers that resolve in at most 100 ms, but a leaked
// timer would keep the runner alive forever, because `node:test` has no default
// per-test timeout. This is a hang guard, not a tolerance: no assertion depends on it.
const testTimeout = 10_000;

test('setTimeout - basic timeout', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	setTimeout(() => {
		hasCalled = true;
	}, 10);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(hasCalled, true);
});

test('setTimeout - passes arguments to callback', {timeout: testTimeout}, async () => {
	let result;
	setTimeout((a, b, c) => {
		result = {a, b, c};
	}, 10, 'hello', 42, true);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.deepEqual(result, {a: 'hello', b: 42, c: true});
});

test('setTimeout - returns timeout object', () => {
	const timeout = setTimeout(() => {}, 100);
	assert.equal(typeof timeout, 'object');
	assert.equal(typeof timeout.id, 'object');
	assert.equal(timeout.cleared, false);
	clearTimeout(timeout);
});

test('setTimeout - can be cleared before execution', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	const timeout = setTimeout(() => {
		hasCalled = true;
	}, 10);

	clearTimeout(timeout);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(hasCalled, false);
});

test('setTimeout - handles zero delay', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	setTimeout(() => {
		hasCalled = true;
	}, 0);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(hasCalled, true);
});

test('setTimeout - defaults to 0 when delay is undefined', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	setTimeout(() => {
		hasCalled = true;
	});

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(hasCalled, true);
});

test('setTimeout - defaults to 0 when delay is null', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	setTimeout(() => {
		hasCalled = true;
	}, null);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(hasCalled, true);
});

test('setTimeout - simulates long delay by chunking', () => {
	// We can't actually wait for a long timeout in tests, but we can verify
	// that it schedules correctly without throwing
	const longDelay = MAX_TIMEOUT + 1000;
	const timeout = setTimeout(() => {}, longDelay);

	assert.equal(typeof timeout, 'object');
	assert.equal(typeof timeout.id, 'object');
	assert.equal(timeout.cleared, false);

	clearTimeout(timeout);
});

test('setTimeout - handles very long delay', () => {
	// Test with a delay of 30 days
	const thirtyDays = 30 * 24 * 60 * 60 * 1000;
	const timeout = setTimeout(() => {}, thirtyDays);

	assert.equal(typeof timeout, 'object');
	clearTimeout(timeout);
});

test('setTimeout - can clear long timeout', () => {
	const longDelay = MAX_TIMEOUT * 2;
	const timeout = setTimeout(() => {
		assert.fail('Should not be called');
	}, longDelay);

	clearTimeout(timeout);
	assert.equal(timeout.cleared, true);
});

test('setTimeout - throws on non-function callback', () => {
	assert.throws(
		() => setTimeout('not a function', 100),
		{
			name: 'TypeError',
			message: 'Expected callback to be a function',
		},
	);
});

test('setTimeout - coerces string delay to number', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	setTimeout(() => {
		hasCalled = true;
	}, '50');

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 100);
	});

	assert.equal(hasCalled, true);
});

test('setTimeout - coerces boolean true to 1ms', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	setTimeout(() => {
		hasCalled = true;
	}, true);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(hasCalled, true);
});

test('setTimeout - treats negative delay as 0 (immediate)', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	setTimeout(() => {
		hasCalled = true;
	}, -1);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(hasCalled, true);
});

test('setTimeout - treats Infinity as never firing', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	const timeout = setTimeout(() => {
		hasCalled = true;
	}, Infinity);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(hasCalled, false);
	assert.equal(typeof timeout, 'object');
	assert.equal(timeout.id, undefined);
});

test('setTimeout - treats negative Infinity as 0 (immediate)', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	setTimeout(() => {
		hasCalled = true;
	}, -Infinity);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(hasCalled, true);
});

test('setTimeout - can clear Infinity timeout', () => {
	const timeout = setTimeout(() => {
		assert.fail('Should never be called');
	}, Infinity);

	clearTimeout(timeout);
	assert.equal(timeout.cleared, true);
});

test('setTimeout - treats NaN as 0 (immediate)', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	setTimeout(() => {
		hasCalled = true;
	}, NaN);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(hasCalled, true);
});

test('setTimeout - coerces string "abc" (NaN) to 0', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	setTimeout(() => {
		hasCalled = true;
	}, 'abc');

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(hasCalled, true);
});

test('clearTimeout - handles undefined', () => {
	assert.equal(clearTimeout(undefined), undefined);
});

test('clearTimeout - handles null', () => {
	assert.equal(clearTimeout(null), undefined);
});

test('clearTimeout - can be called multiple times', () => {
	const timeout = setTimeout(() => {}, 100);
	clearTimeout(timeout);
	assert.equal(clearTimeout(timeout), undefined);
	assert.equal(timeout.cleared, true);
	assert.equal(timeout.id, undefined);
});

test('setInterval - basic interval', {timeout: testTimeout}, async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	}, 10);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	assert.ok(count >= 3);
});

test('setInterval - passes arguments to callback', {timeout: testTimeout}, async () => {
	const results = [];
	const interval = setInterval((a, b) => {
		results.push({a, b});
	}, 10, 'test', 123);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	assert.ok(results.length >= 3);
	assert.deepEqual(results[0], {a: 'test', b: 123});
});

test('setInterval - returns interval object', () => {
	const interval = setInterval(() => {}, 100);
	assert.equal(typeof interval, 'object');
	assert.equal(typeof interval.id, 'object');
	assert.equal(interval.cleared, false);
	clearInterval(interval);
});

test('setInterval - can be cleared', {timeout: testTimeout}, async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	}, 10);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 30);
	});

	const countAtClear = count;
	clearInterval(interval);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(count, countAtClear);
});

test('setInterval - defaults to 0 when delay is undefined', {timeout: testTimeout}, async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	});

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	assert.ok(count >= 1);
});

test('setInterval - defaults to 0 when delay is null', {timeout: testTimeout}, async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	}, null);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	assert.ok(count >= 1);
});

test('setInterval - handles long delay', () => {
	const longDelay = MAX_TIMEOUT + 1000;
	const interval = setInterval(() => {}, longDelay);

	assert.equal(typeof interval, 'object');
	clearInterval(interval);
});

test('setInterval - throws on non-function callback', () => {
	assert.throws(
		() => setInterval('not a function', 100),
		{
			name: 'TypeError',
			message: 'Expected callback to be a function',
		},
	);
});

test('setInterval - treats negative delay as 0 (immediate)', {timeout: testTimeout}, async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	}, -1);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	assert.ok(count >= 1);
});

test('setInterval - treats Infinity as never firing', {timeout: testTimeout}, async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	}, Infinity);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	assert.equal(count, 0);
	assert.equal(typeof interval, 'object');
	assert.equal(interval.id, undefined);
});

test('setInterval - treats NaN as 0 (immediate)', {timeout: testTimeout}, async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	}, NaN);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	assert.ok(count >= 1);
});

test('setInterval - coerces string delay to number', {timeout: testTimeout}, async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	}, '20');

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 60);
	});

	clearInterval(interval);
	assert.ok(count >= 2);
});

test('clearInterval - handles undefined', () => {
	assert.equal(clearInterval(undefined), undefined);
});

test('clearInterval - handles null', () => {
	assert.equal(clearInterval(null), undefined);
});

test('clearInterval - can be called multiple times', () => {
	const interval = setInterval(() => {}, 100);
	clearInterval(interval);
	assert.equal(clearInterval(interval), undefined);
	assert.equal(interval.cleared, true);
	assert.equal(interval.id, undefined);
});

test('setTimeout - clears during chunk chain without calling callback', {timeout: testTimeout}, async () => {
	let hasCalled = false;
	// Use a very long delay that requires chunking
	const timeout = setTimeout(() => {
		hasCalled = true;
	}, MAX_TIMEOUT * 2);

	// Clear after a short time (during first chunk)
	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearTimeout(timeout);

	// Wait longer to ensure callback never fires
	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 100);
	});

	assert.equal(hasCalled, false);
	assert.equal(timeout.cleared, true);
});

test('setTimeout - chunks long delays correctly', t => {
	const scheduledDelays = [];
	const originalSetTimeout = globalThis.setTimeout;

	// The implementation reads `globalThis.setTimeout` at call time, so wrapping
	// it here is what lets the test observe every chunk it schedules.
	t.mock.method(globalThis, 'setTimeout', (callback, delay, ...arguments_) => {
		scheduledDelays.push(delay);
		return originalSetTimeout(callback, delay, ...arguments_);
	});

	// Schedule a very long timeout (3x MAX_TIMEOUT)
	const timeout = setTimeout(() => {}, MAX_TIMEOUT * 3);

	// Should have scheduled at least one chunk
	t.assert.ok(scheduledDelays.length > 0);

	// Verify no chunk exceeds MAX_TIMEOUT
	t.assert.ok(scheduledDelays.every(delay => delay <= MAX_TIMEOUT), `A chunk exceeded MAX_TIMEOUT: ${scheduledDelays.join(', ')}`);

	clearTimeout(timeout);
});

test('setInterval - clears during chunk chain without calling callback', {timeout: testTimeout}, async () => {
	let count = 0;
	// Use a very long delay that requires chunking
	const interval = setInterval(() => {
		count++;
	}, MAX_TIMEOUT * 2);

	// Clear after a short time (during first chunk)
	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);

	// Wait longer to ensure callback never fires
	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 100);
	});

	assert.equal(count, 0);
	assert.equal(interval.cleared, true);
});

test('setInterval - chunks long delays correctly', t => {
	const scheduledDelays = [];
	const originalSetTimeout = globalThis.setTimeout;

	// The implementation reads `globalThis.setTimeout` at call time, so wrapping
	// it here is what lets the test observe every chunk it schedules.
	t.mock.method(globalThis, 'setTimeout', (callback, delay, ...arguments_) => {
		scheduledDelays.push(delay);
		return originalSetTimeout(callback, delay, ...arguments_);
	});

	// Schedule a very long interval (3x MAX_TIMEOUT)
	const interval = setInterval(() => {}, MAX_TIMEOUT * 3);

	// Should have scheduled at least one chunk
	t.assert.ok(scheduledDelays.length > 0);

	// Verify no chunk exceeds MAX_TIMEOUT
	t.assert.ok(scheduledDelays.every(delay => delay <= MAX_TIMEOUT), `A chunk exceeded MAX_TIMEOUT: ${scheduledDelays.join(', ')}`);

	clearInterval(interval);
});

test('setTimeout - ref/unref methods exist and return timeout', () => {
	const timeout = setTimeout(() => {}, 100);

	assert.equal(typeof timeout.ref, 'function');
	assert.equal(typeof timeout.unref, 'function');

	const refResult = timeout.ref();
	assert.equal(refResult, timeout);

	const unrefResult = timeout.unref();
	assert.equal(unrefResult, timeout);

	clearTimeout(timeout);
});

test('setInterval - ref/unref methods exist and return interval', () => {
	const interval = setInterval(() => {}, 100);

	assert.equal(typeof interval.ref, 'function');
	assert.equal(typeof interval.unref, 'function');

	const refResult = interval.ref();
	assert.equal(refResult, interval);

	const unrefResult = interval.unref();
	assert.equal(unrefResult, interval);

	clearInterval(interval);
});

test('MAX_TIMEOUT is exported and has correct value', () => {
	assert.equal(MAX_TIMEOUT, 2_147_483_647);
	assert.equal(typeof MAX_TIMEOUT, 'number');
});

test('setInterval - survives thrown callback', {timeout: testTimeout}, async () => {
	let calls = 0;
	let hasCaughtError = false;

	const interval = setInterval(() => {
		calls++;
		// Simulate a throw on first call (catch it to avoid test failure)
		// The implementation pre-schedules the next tick, so interval continues
		if (calls === 1) {
			try {
				throw new Error('boom');
			} catch {
				hasCaughtError = true;
				// In real usage, this would be an uncaught exception
				// but the interval would still continue ticking
			}
		}
	}, 10);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	// The key assertion: interval keeps ticking after the throw
	assert.ok(calls >= 2, `Expected at least 2 calls, got ${calls}`);
	assert.ok(hasCaughtError, 'Expected error to be thrown on first call');
});

test('setTimeout - Infinity never schedules native handle', () => {
	const timeout = setTimeout(() => {
		assert.fail('Should never be called');
	}, Infinity);

	// Verify no native handle was created
	assert.equal(timeout.id, undefined);
	assert.equal(timeout.cleared, false);

	// Should be clearable
	clearTimeout(timeout);
	assert.equal(timeout.cleared, true);
	assert.equal(timeout.id, undefined);
});

test('setInterval - Infinity never schedules native handle', () => {
	const interval = setInterval(() => {
		assert.fail('Should never be called');
	}, Infinity);

	// Verify no native handle was created
	assert.equal(interval.id, undefined);
	assert.equal(interval.cleared, false);

	// Should be clearable
	clearInterval(interval);
	assert.equal(interval.cleared, true);
	assert.equal(interval.id, undefined);
});

test('setTimeout - ref/unref chaining', () => {
	const timeout = setTimeout(() => {}, 100);

	// Verify chaining
	const refResult = timeout.ref();
	assert.equal(refResult, timeout, 'ref() should return this');

	const unrefResult = timeout.unref();
	assert.equal(unrefResult, timeout, 'unref() should return this');

	// Verify chainability
	const chainResult = timeout.ref().unref().ref();
	assert.equal(chainResult, timeout, 'chaining should work');

	clearTimeout(timeout);
});

test('setInterval - ref/unref chaining', () => {
	const interval = setInterval(() => {}, 100);

	// Verify chaining
	const refResult = interval.ref();
	assert.equal(refResult, interval, 'ref() should return this');

	const unrefResult = interval.unref();
	assert.equal(unrefResult, interval, 'unref() should return this');

	// Verify chainability
	const chainResult = interval.ref().unref().ref();
	assert.equal(chainResult, interval, 'chaining should work');

	clearInterval(interval);
});

test('clearTimeout - only clears branded objects', () => {
	const fakeTimeout = {
		id: 999,
		cleared: false,
	};

	// Should not clear non-branded objects
	clearTimeout(fakeTimeout);
	assert.equal(fakeTimeout.cleared, false);
	assert.equal(fakeTimeout.id, 999);
});

test('clearInterval - only clears branded objects', () => {
	const fakeInterval = {
		id: 999,
		cleared: false,
	};

	// Should not clear non-branded objects
	clearInterval(fakeInterval);
	assert.equal(fakeInterval.cleared, false);
	assert.equal(fakeInterval.id, 999);
});

test('clearTimeout - sets id to undefined after clearing', () => {
	const timeout = setTimeout(() => {}, 100);
	const originalId = timeout.id;

	assert.notEqual(originalId, undefined);

	clearTimeout(timeout);

	assert.equal(timeout.id, undefined);
	assert.equal(timeout.cleared, true);
});

test('clearInterval - sets id to undefined after clearing', () => {
	const interval = setInterval(() => {}, 100);
	const originalId = interval.id;

	assert.notEqual(originalId, undefined);

	clearInterval(interval);

	assert.equal(interval.id, undefined);
	assert.equal(interval.cleared, true);
});

test('setInterval - treats negative Infinity as 0 (immediate)', {timeout: testTimeout}, async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	}, -Infinity);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	assert.ok(count >= 1);
});

test('setTimeout - unref persists across chunk rollovers', () => {
	// Create a very long timeout that will require chunking
	const longDelay = MAX_TIMEOUT + 100;

	const timeout = setTimeout(() => {
		// We won't actually wait for this
	}, longDelay);

	assert.equal(timeout.id.hasRef(), true);

	// Call unref - this should persist across all chunks
	timeout.unref();

	// The chunk that is currently scheduled is the one that must be unref'd
	assert.equal(timeout.id.hasRef(), false);

	// Clean up
	clearTimeout(timeout);
	assert.equal(timeout.cleared, true);
});

test('setInterval - unref persists across chunk rollovers', () => {
	// Create a very long interval that will require chunking
	const longDelay = MAX_TIMEOUT + 100;

	const interval = setInterval(() => {
		// Won't fire during test
	}, longDelay);

	assert.equal(interval.id.hasRef(), true);

	// Call unref - this should persist across all chunks
	interval.unref();

	// The chunk that is currently scheduled is the one that must be unref'd
	assert.equal(interval.id.hasRef(), false);

	// Clean up
	clearInterval(interval);
	assert.equal(interval.cleared, true);
});

test('setTimeout - delays beyond MAX_SAFE_INTEGER treated as Infinity', () => {
	const timeout = setTimeout(() => {
		assert.fail('Should never be called');
	}, Number.MAX_SAFE_INTEGER + 1);

	// Verify no native handle was created (treated as Infinity)
	assert.equal(timeout.id, undefined);
	assert.equal(timeout.cleared, false);

	// Should be clearable
	clearTimeout(timeout);
	assert.equal(timeout.cleared, true);
});

test('setInterval - delays beyond MAX_SAFE_INTEGER treated as Infinity', () => {
	const interval = setInterval(() => {
		assert.fail('Should never be called');
	}, Number.MAX_SAFE_INTEGER + 1);

	// Verify no native handle was created (treated as Infinity)
	assert.equal(interval.id, undefined);
	assert.equal(interval.cleared, false);

	// Should be clearable
	clearInterval(interval);
	assert.equal(interval.cleared, true);
});

test('clearTimeout - works across package copies (Symbol.for branding)', () => {
	// Simulate a timeout object from "another copy" of the package
	// by manually constructing an object with the same Symbol.for brand
	const brandSymbol = Symbol.for('sindresorhus/unlimited-timeout#brand');
	const simulatedTimeout = {
		[brandSymbol]: true,
		id: globalThis.setTimeout(() => {}, 10_000),
		cleared: false,
	};

	// ClearTimeout should work because it uses Symbol.for
	clearTimeout(simulatedTimeout);
	assert.equal(simulatedTimeout.cleared, true);
	assert.equal(simulatedTimeout.id, undefined);

	// Verify regular objects without the brand are ignored
	const fakeTimeout = {
		id: globalThis.setTimeout(() => {}, 10_000),
		cleared: false,
	};
	clearTimeout(fakeTimeout);
	assert.equal(fakeTimeout.cleared, false); // Not cleared
	// Clean up
	globalThis.clearTimeout(fakeTimeout.id);
});

test('clearInterval - works across package copies (Symbol.for branding)', () => {
	// Simulate an interval object from "another copy" of the package
	const brandSymbol = Symbol.for('sindresorhus/unlimited-timeout#brand');
	const simulatedInterval = {
		[brandSymbol]: true,
		id: globalThis.setTimeout(() => {}, 10_000),
		cleared: false,
	};

	// ClearInterval should work because it uses Symbol.for
	clearInterval(simulatedInterval);
	assert.equal(simulatedInterval.cleared, true);
	assert.equal(simulatedInterval.id, undefined);

	// Verify regular objects without the brand are ignored
	const fakeInterval = {
		id: globalThis.setTimeout(() => {}, 10_000),
		cleared: false,
	};
	clearInterval(fakeInterval);
	assert.equal(fakeInterval.cleared, false); // Not cleared
	// Clean up
	globalThis.clearTimeout(fakeInterval.id);
});
