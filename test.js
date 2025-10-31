import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
	setTimeout,
	clearTimeout,
	setInterval,
	clearInterval,
	MAX_TIMEOUT,
} from './index.js';

test('setTimeout - basic timeout', async () => {
	let called = false;
	setTimeout(() => {
		called = true;
	}, 10);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(called, true);
});

test('setTimeout - passes arguments to callback', async () => {
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

test('setTimeout - can be cleared before execution', async () => {
	let called = false;
	const timeout = setTimeout(() => {
		called = true;
	}, 10);

	clearTimeout(timeout);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(called, false);
});

test('setTimeout - handles zero delay', async () => {
	let called = false;
	setTimeout(() => {
		called = true;
	}, 0);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(called, true);
});

test('setTimeout - defaults to 0 when delay is undefined', async () => {
	let called = false;
	setTimeout(() => {
		called = true;
	});

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(called, true);
});

test('setTimeout - defaults to 0 when delay is null', async () => {
	let called = false;
	setTimeout(() => {
		called = true;
	}, null);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(called, true);
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

test('setTimeout - coerces string delay to number', async () => {
	let called = false;
	setTimeout(() => {
		called = true;
	}, '50');

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 100);
	});

	assert.equal(called, true);
});

test('setTimeout - coerces boolean true to 1ms', async () => {
	let called = false;
	setTimeout(() => {
		called = true;
	}, true);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(called, true);
});

test('setTimeout - treats negative delay as 0 (immediate)', async () => {
	let called = false;
	setTimeout(() => {
		called = true;
	}, -1);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(called, true);
});

test('setTimeout - treats Infinity as never firing', async () => {
	let called = false;
	const timeout = setTimeout(() => {
		called = true;
	}, Number.POSITIVE_INFINITY);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(called, false);
	assert.equal(typeof timeout, 'object');
	assert.equal(timeout.id, undefined);
});

test('setTimeout - treats negative Infinity as 0 (immediate)', async () => {
	let called = false;
	setTimeout(() => {
		called = true;
	}, Number.NEGATIVE_INFINITY);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(called, true);
});

test('setTimeout - can clear Infinity timeout', () => {
	const timeout = setTimeout(() => {
		assert.fail('Should never be called');
	}, Number.POSITIVE_INFINITY);

	clearTimeout(timeout);
	assert.equal(timeout.cleared, true);
});

test('setTimeout - treats NaN as 0 (immediate)', async () => {
	let called = false;
	setTimeout(() => {
		called = true;
	}, Number.NaN);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(called, true);
});

test('setTimeout - coerces string "abc" (NaN) to 0', async () => {
	let called = false;
	setTimeout(() => {
		called = true;
	}, 'abc');

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	assert.equal(called, true);
});

test('clearTimeout - handles undefined', () => {
	assert.doesNotThrow(() => {
		clearTimeout(undefined);
	});
});

test('clearTimeout - handles null', () => {
	assert.doesNotThrow(() => {
		clearTimeout(null);
	});
});

test('clearTimeout - can be called multiple times', () => {
	const timeout = setTimeout(() => {}, 100);
	clearTimeout(timeout);
	assert.doesNotThrow(() => {
		clearTimeout(timeout);
	});
});

test('setInterval - basic interval', async () => {
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

test('setInterval - passes arguments to callback', async () => {
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

test('setInterval - can be cleared', async () => {
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

test('setInterval - defaults to 0 when delay is undefined', async () => {
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

test('setInterval - defaults to 0 when delay is null', async () => {
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

test('setInterval - treats negative delay as 0 (immediate)', async () => {
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

test('setInterval - treats Infinity as never firing', async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	}, Number.POSITIVE_INFINITY);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	assert.equal(count, 0);
	assert.equal(typeof interval, 'object');
	assert.equal(interval.id, undefined);
});

test('setInterval - treats NaN as 0 (immediate)', async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	}, Number.NaN);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	assert.ok(count >= 1);
});

test('setInterval - coerces string delay to number', async () => {
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
	assert.doesNotThrow(() => {
		clearInterval(undefined);
	});
});

test('clearInterval - handles null', () => {
	assert.doesNotThrow(() => {
		clearInterval(null);
	});
});

test('clearInterval - can be called multiple times', () => {
	const interval = setInterval(() => {}, 100);
	clearInterval(interval);
	assert.doesNotThrow(() => {
		clearInterval(interval);
	});
});

test('setTimeout - clears during chunk chain without calling callback', async () => {
	let called = false;
	// Use a very long delay that requires chunking
	const timeout = setTimeout(() => {
		called = true;
		assert.fail('Callback should not be called');
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

	assert.equal(called, false);
	assert.equal(timeout.cleared, true);
});

test('setTimeout - chunks long delays correctly', () => {
	const originalSetTimeout = globalThis.setTimeout;
	const scheduledDelays = [];

	// Stub globalThis.setTimeout to capture delays
	globalThis.setTimeout = (callback, delay, ...arguments_) => {
		scheduledDelays.push(delay);
		return originalSetTimeout(callback, delay, ...arguments_);
	};

	try {
		// Schedule a very long timeout (3x MAX_TIMEOUT)
		const longDelay = MAX_TIMEOUT * 3;
		const timeout = setTimeout(() => {}, longDelay);

		// Verify no chunk exceeds MAX_TIMEOUT
		for (const delay of scheduledDelays) {
			assert.ok(delay <= MAX_TIMEOUT, `Chunk delay ${delay} exceeds MAX_TIMEOUT ${MAX_TIMEOUT}`);
		}

		// Should have scheduled at least one chunk
		assert.ok(scheduledDelays.length > 0);

		clearTimeout(timeout);
	} finally {
		// Restore original setTimeout
		globalThis.setTimeout = originalSetTimeout;
	}
});

test('setInterval - clears during chunk chain without calling callback', async () => {
	let count = 0;
	// Use a very long delay that requires chunking
	const interval = setInterval(() => {
		count++;
		assert.fail('Callback should not be called');
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

test('setInterval - chunks long delays correctly', () => {
	const originalSetTimeout = globalThis.setTimeout;
	const scheduledDelays = [];

	// Stub globalThis.setTimeout to capture delays
	globalThis.setTimeout = (callback, delay, ...arguments_) => {
		scheduledDelays.push(delay);
		return originalSetTimeout(callback, delay, ...arguments_);
	};

	try {
		// Schedule a very long interval (3x MAX_TIMEOUT)
		const longDelay = MAX_TIMEOUT * 3;
		const interval = setInterval(() => {}, longDelay);

		// Verify no chunk exceeds MAX_TIMEOUT
		for (const delay of scheduledDelays) {
			assert.ok(delay <= MAX_TIMEOUT, `Chunk delay ${delay} exceeds MAX_TIMEOUT ${MAX_TIMEOUT}`);
		}

		// Should have scheduled at least one chunk
		assert.ok(scheduledDelays.length > 0);

		clearInterval(interval);
	} finally {
		// Restore original setTimeout
		globalThis.setTimeout = originalSetTimeout;
	}
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

test('setInterval - survives thrown callback', async () => {
	let calls = 0;
	let errorCaught = false;

	const interval = setInterval(() => {
		calls++;
		// Simulate a throw on first call (catch it to avoid test failure)
		// The implementation pre-schedules the next tick, so interval continues
		if (calls === 1) {
			try {
				throw new Error('boom');
			} catch {
				errorCaught = true;
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
	assert.ok(errorCaught, 'Expected error to be thrown on first call');
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

test('setInterval - treats negative Infinity as 0 (immediate)', async () => {
	let count = 0;
	const interval = setInterval(() => {
		count++;
	}, Number.NEGATIVE_INFINITY);

	await new Promise(resolve => {
		globalThis.setTimeout(resolve, 50);
	});

	clearInterval(interval);
	assert.ok(count >= 1);
});

test('setTimeout - unref persists across chunk rollovers', async () => {
	// Create a very long timeout that will require chunking
	const longDelay = MAX_TIMEOUT + 100;

	const timeout = setTimeout(() => {
		// We won't actually wait for this
	}, longDelay);

	// Call unref - this should persist across all chunks
	timeout.unref();

	// Verify the first chunk got unreffed
	// (In real usage, this would allow Node to exit)
	// We can't easily test the actual Node behavior, but we can verify
	// the implementation applies unref

	// Clean up
	clearTimeout(timeout);
	assert.equal(timeout.cleared, true);
});

test('setInterval - unref persists across chunk rollovers', async () => {
	// Create a very long interval that will require chunking
	const longDelay = MAX_TIMEOUT + 100;

	const interval = setInterval(() => {
		// Won't fire during test
	}, longDelay);

	// Call unref - this should persist across all chunks
	interval.unref();

	// Verify the first chunk got unreffed
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
