import { BehaviorSubject, EMPTY } from 'rxjs';

const states = new WeakMap();

export function state$(node) {
	let state$ = null;
	let parentNode = node; // .parentNode;
	while (!state$ && parentNode) {
		if (states.has(parentNode)) {
			state$ = states.get(parentNode);
		} else {
			parentNode = parentNode.parentNode;
		}
	}
	return state$ || EMPTY;
}

export function getState(node) {
	const state = state$(node);
	return state ? state.getValue() : null;
}

export function getParentState$(node) {
	let results = [];
	let parentNode = node.parentNode;
	while (results.length < 2 && parentNode) {
		if (states.has(parentNode)) {
			results.push(states.get(parentNode));
		} else {
			parentNode = parentNode.parentNode;
		}
	}
	// console.log(results.map(x => JSON.stringify(x.getValue())).join(' - '));
	if (results.length === 2) {
		return results[1];
	} else {
		return EMPTY;
	}
}

export function getParentState(node) {
	const state$ = getParentState$(node);
	return state$ ? state$.getValue() : null;
}

export function newState(node, state_ = {}) {
	function onChange(key, value) {
		const className = `state-${key}`;
		if (typeof value === 'string' || typeof value === 'number') {
			node.setAttribute(className, value);
		} else {
			node.classList.toggle(className, value);
		}
	}
	Object.keys(state_).forEach(key => {
		onChange(key, state_[key]);
	});
	// console.log(Array.from(node.classList));
	const change$ = new BehaviorSubject(state_);
	const handler = {
		/*
		get(state, key, proxy) {
			// console.log(state, key, proxy);
			return Reflect.get(...arguments);
		},
		*/
		set(state, key, value) {
			const status = Reflect.set(...arguments);
			onChange(key, value);
			change$.next({ ...state });
			// console.log(state, key, value, status);
			return status;
		},
	}
	const proxy = new Proxy(state_, handler);
	// console.log('proxy', proxy);
	if (states.has(node)) {
		throw ('only one state per node');
	} else {
		states.set(node, change$);
	}
	return proxy;
}

export function deleteState(node) {
	if (states.has(node)) {
		states.delete(node);
	}
}
