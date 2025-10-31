// Maximum safe timeout value for setTimeout in JavaScript (2^31 - 1 milliseconds)
// This is approximately 24.8 days
export const MAX_TIMEOUT = 2_147_483_647;

// Brand symbol to identify our timeout/interval objects
// Use Symbol.for to ensure cross-copy compatibility (monorepos, hoisted deps, etc.)
const brandSymbol = Symbol.for('sindresorhus/unlimited-timeout#brand');

export function setTimeout(callback, delay, ...arguments_) {
	if (typeof callback !== 'function') {
		throw new TypeError('Expected callback to be a function');
	}

	// Coerce delay to number, matching native setTimeout behavior
	delay ??= 0;
	delay = Number(delay);

	let shouldUnref = false;
	const timeout = {
		[brandSymbol]: true,
		id: undefined,
		cleared: false,
		ref() {
			shouldUnref = false;
			timeout.id?.ref?.();
			return timeout;
		},
		unref() {
			shouldUnref = true;
			timeout.id?.unref?.();
			return timeout;
		},
	};

	// Treat delays beyond MAX_SAFE_INTEGER as Infinity (precision loss)
	// and positive Infinity means wait forever (never fire)
	if (delay === Number.POSITIVE_INFINITY || delay > Number.MAX_SAFE_INTEGER) {
		return timeout;
	}

	// Clamp invalid values to 0 (NaN, negative numbers result in immediate firing)
	if (!Number.isFinite(delay) || delay < 0) {
		delay = 0;
	}

	// Track target timestamp to avoid overshoot when chunks fire late
	const targetTime = performance.now() + delay;

	const schedule = remainingDelay => {
		if (timeout.cleared) {
			return;
		}

		if (remainingDelay <= MAX_TIMEOUT) {
			// Final timeout - execute callback
			timeout.id = globalThis.setTimeout(() => {
				if (!timeout.cleared) {
					callback(...arguments_);
				}
			}, remainingDelay);

			if (shouldUnref) {
				timeout.id?.unref?.();
			}
		} else {
			// Schedule next chunk
			timeout.id = globalThis.setTimeout(() => {
				const now = performance.now();
				const remaining = Math.max(0, targetTime - now);
				schedule(remaining);
			}, MAX_TIMEOUT);

			if (shouldUnref) {
				timeout.id?.unref?.();
			}
		}
	};

	schedule(delay);

	return timeout;
}

export function clearTimeout(timeout) {
	if (!timeout || typeof timeout !== 'object' || !timeout[brandSymbol]) {
		return;
	}

	timeout.cleared = true;

	if (timeout.id !== undefined) {
		globalThis.clearTimeout(timeout.id);
		timeout.id = undefined;
	}
}

export function setInterval(callback, delay, ...arguments_) {
	if (typeof callback !== 'function') {
		throw new TypeError('Expected callback to be a function');
	}

	// Coerce delay to number, matching native setInterval behavior
	delay ??= 0;
	delay = Number(delay);

	let shouldUnref = false;
	const interval = {
		[brandSymbol]: true,
		id: undefined,
		cleared: false,
		ref() {
			shouldUnref = false;
			interval.id?.ref?.();
			return interval;
		},
		unref() {
			shouldUnref = true;
			interval.id?.unref?.();
			return interval;
		},
	};

	// Treat delays beyond MAX_SAFE_INTEGER as Infinity (precision loss)
	// and positive Infinity means wait forever (never fire)
	if (delay === Number.POSITIVE_INFINITY || delay > Number.MAX_SAFE_INTEGER) {
		return interval;
	}

	// Clamp invalid values to 0 (NaN, negative numbers result in immediate firing)
	if (!Number.isFinite(delay) || delay < 0) {
		delay = 0;
	}

	// Track target timestamp to avoid drift (use monotonic clock)
	let nextTargetTime = performance.now() + delay;

	const schedule = remainingDelay => {
		if (interval.cleared) {
			return;
		}

		if (remainingDelay <= MAX_TIMEOUT) {
			// Final timeout before callback
			interval.id = globalThis.setTimeout(() => {
				if (interval.cleared) {
					return;
				}

				// Pre-schedule next tick so throws don't kill the interval
				nextTargetTime += delay;
				const now = performance.now();
				const nextDelay = Math.max(0, nextTargetTime - now);
				schedule(nextDelay);

				// Now run user code — if it throws, the next tick still happens
				callback(...arguments_);
			}, remainingDelay);

			if (shouldUnref) {
				interval.id?.unref?.();
			}
		} else {
			// Schedule next chunk
			interval.id = globalThis.setTimeout(() => {
				const now = performance.now();
				const nextDelay = Math.max(0, nextTargetTime - now);
				schedule(nextDelay);
			}, MAX_TIMEOUT);

			if (shouldUnref) {
				interval.id?.unref?.();
			}
		}
	};

	schedule(delay);

	return interval;
}

export function clearInterval(interval) {
	if (!interval || typeof interval !== 'object' || !interval[brandSymbol]) {
		return;
	}

	interval.cleared = true;

	if (interval.id !== undefined) {
		globalThis.clearTimeout(interval.id);
		interval.id = undefined;
	}
}
