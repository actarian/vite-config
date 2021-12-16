import { BehaviorSubject, EMPTY, Subject } from 'rxjs';

const modules = import.meta.glob('../../modules/*.js');

const noderef = new WeakMap();

export class Component {

	constructor(node, data, unsubscribe$, originalNode) {
		this.node = node;
		this.data = data;
		this.unsubscribe$ = unsubscribe$;
		this.originalNode = originalNode;
		let refs;
		if (noderef.has(node)) {
			refs = noderef.get(node);
		} else {
			refs = [];
			noderef.set(node, refs);
		}
		refs.push(this);
		this.onInit();
	}

	onInit() { }

	onDestroy() { }

	destroy() {
		const node = this.node;
		this.unsubscribe$.next();
		this.onDestroy();
		this.node = null;
		this.unsubscribe$ = null;
		const refs = noderef.get(node);
		refs.splice(refs.indexOf(this), 1);
		if (refs.length === 0) {
			noderef.delete(node);
		}
		// ???
		Component.instances.forEach(instances => {
			const index = instances.indexOf(this);
			if (index !== -1) {
				instances.splice(index, 1);
			}
		});
	}

	get state() {
		if (!this.state_) {
			this.state_ = Component.newState(this.node);
		}
		return this.state_;
	}
	set state(state) {
		throw 'state cannot be set';
	}

	get state$() {
		return Component.getState$(this.node);
	}

	static getState$(node) {
		let state$ = null;
		let parentNode = node; // .parentNode;
		while (!state$ && parentNode) {
			if (Component.states.has(parentNode)) {
				state$ = Component.states.get(parentNode);
			} else {
				parentNode = parentNode.parentNode;
			}
		}
		return state$ || EMPTY;
	}

	static getState(node) {
		const state$ = this.getState$(node);
		return state$ ? state$.getValue() : null;
	}

	static getParentState$(node) {
		let states = [];
		let parentNode = node.parentNode;
		while (states.length < 2 && parentNode) {
			if (Component.states.has(parentNode)) {
				states.push(Component.states.get(parentNode));
			} else {
				parentNode = parentNode.parentNode;
			}
		}
		// console.log(states.map(x => JSON.stringify(x.getValue())).join(' - '));
		if (states.length === 2) {
			return states[1];
		} else {
			return EMPTY;
		}
	}

	static getParentState(node) {
		const state$ = this.getParentState$(node);
		return state$ ? state$.getValue() : null;
	}

	static factories = new Map();
	static observers = new WeakMap();
	static instances = new WeakMap();
	static states = new WeakMap();

	static newState(node, state_ = {}) {
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
		if (this.states.has(node)) {
			throw ('only one state per node');
		} else {
			this.states.set(node, change$);
		}
		return proxy;
	}

	static getExpression(expression) {
		return Function('state', `
			with(state) {
				try {
					return ${expression};
				} catch (error) {
					console.warn('getExpression.error', error, 'state', state);
					return null;
				}
			}
		`);
	}

	static getFactory(factory) {
		return new Promise((resolve, reject) => {
			if (Array.isArray(factory)) {
				const name = factory[0];
				if (this.factories.has(name)) {
					resolve(this.factories.get(name));
				} else {
					const src = factory[1];
					const key = Object.keys(modules).find(key => key.indexOf(src) !== -1);
					if (key) {
						const loader = modules[key];
						loader().then(module => {
							if (name in module) {
								factory = module[name];
								this.factories.set(name, factory);
								resolve(factory);
							} else {
								reject(`cannot find ${name} in module ${src}`);
							}
						});
					} else {
						reject(`cannot find ${name} in modules`);
					}
				}
			} else {
				resolve(factory);
			}
		});
	}

	static matches(factories, node = document) {
		const results = new Map();
		const datas = new WeakMap();
		const originalNodes = new WeakMap();
		factories.sort((a, b) => {
			const isArrayA = Array.isArray(a);
			const isArrayB = Array.isArray(b);
			if (isArrayA && isArrayB) {
				return 0;
			} else if (isArrayA) {
				return 1;
			} else if (isArrayB) {
				return -1;
			} else {
				const isStructureA = a.meta.structure;
				const isStructureB = b.meta.structure;
				if (isStructureA && isStructureB) {
					return 0;
				} else if (isStructureA) {
					return -1;
				} else {
					return 1;
				}
			}
		});
		const selectors = factories.map((factory) => (Array.isArray(factory) ? factory[2] : factory.meta.selector));
		const match = function(node) {
			let structure = false;
			selectors.forEach(function(selector, i) {
				if (!structure && node.matches(selector)) {
					if (!results.has(node)) {
						results.set(node, []);
					}
					const factory = factories[i];
					if (!Array.isArray(factory) && factory.meta.structure) {
						structure = true;
						const originalNode = node.cloneNode(true);
						originalNodes.set(node, originalNode);
					}
					results.get(node).push(factory);
				}
			});
			if (results.has(node)) {
				const data = {};
				Object.keys(node.dataset).forEach(key => {
					data[key] = node.dataset[key];
					delete node.dataset[key];
				});
				datas.set(node, data);
			}
		};
		function matchNode(node) {
			if (node) {
				match(node);
				matchNode(node.nextElementSibling);
				matchNode(node.firstElementChild);
			}
		}
		if ('matches' in node) {
			match(node);
		}
		matchNode(node.firstElementChild);
		// Component.stats(`matches ${results.size}`);
		return { results, datas, originalNodes };
		// return results;
	}

	static register$(factories, target = document) {
		if (this.instances.has(target)) {
			throw ('node already registered');
			// Component.unregister(target);
		}
		const instances = [];
		this.instances.set(target, instances);
		const instances$ = new Subject();
		const { results, datas, originalNodes } = Component.matches(factories, target);
		const observingNodes = Array.from(results.keys());
		const initialize = (node) => {
			if (results.has(node)) {
				const data = datas.get(node);
				const originalNode = originalNodes.get(node);
				const metas = results.get(node);
				const subject = new Subject();
				metas.forEach(meta => {
					this.getFactory(meta).then(factory => {
						// console.log(factory, factory.prototype);
						/*
						const subject = new Subject();
						factory(node, subject);
						subjects.push(subject);
						*/
						if (factory.length > 0) {
							factory(node, data, subject, originalNode);
							// factory(node, node.dataset, subject, originalNode);
							instances.push(subject);
						} else {
							const instance = new factory.prototype.constructor(node, data, subject, originalNode);
							instances.push(instance);
						}
						instances$.next(instances.slice());
					});
				});
			}
		};
		if ('IntersectionObserver' in window) {
			const observerOptions = {
				root: target.parentNode ? target.parentNode : target,
				rootMargin: '50px',
				threshold: [0.01, 0.99],
			};
			const observer = new IntersectionObserver((entries, observer) => {
				console.log(entries, observer);
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						initialize(entry.target);
						observer.unobserve(entry.target);
					}
				});
			}, observerOptions);
			observingNodes.forEach((node) => {
				observer.observe(node);
			});
			this.observers.set(target, observer);
		} else {
			observingNodes.forEach((node) => {
				initialize(node);
			});
		}
		return instances$;
	}

	static unregister(target = document) {
		if (this.observers.has(target)) {
			const observer = this.observers.get(target);
			observer.disconnect();
			this.observers.delete(target);
		}
		if (this.instances.has(target)) {
			const instances = this.instances.get(target);
			instances.forEach(instance => {
				if (typeof instance.destroy === 'function') {
					instance.destroy();
				} else {
					instance.next();
				}
			});
			this.instances.delete(target);
		}
		if (this.states.has(target)) {
			this.states.delete(target);
		}
	}

	static registeredInstances(target = document) {
		if (this.instances.has(target)) {
			const instances = this.instances.get(target);
			return instances;
		} else {
			return [];
		}
	}

	static create(html) {
		const node = document.createElement('div');
		node.innerHTML = html;
		return node.firstElementChild;
	}

	static stats(key) {
		if (true) {
			return;
		}
		const lpt = this.lpt || performance.now();
		const now = performance.now();
		const div = document.createElement('div');
		const ts = (key ? key : 'stats') + ' (' + Math.floor((now - lpt) * 100) / 100 + 'ms)';
		if (false) {
			div.innerHTML = ts;
			const body = document.querySelector('body');
			body.insertBefore(div, body.firstElementChild);
		} else {
			console.log(ts);
		}
		this.lpt = now;
	}
}
