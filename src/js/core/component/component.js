import { BehaviorSubject, EMPTY, Subject } from 'rxjs';

const modules = import.meta.glob('../../modules/*.js');

const noderef = new Map();

export class Component {

	constructor(node) {
		this.node = node;
		this.unsubscribe$ = new Subject();
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
		let state$ = null;
		let parentNode = this.node.parentNode;
		while (!state$ && parentNode) {
			if (Component.states.has(parentNode)) {
				state$ = Component.states.get(parentNode);
			} else {
				parentNode = parentNode.parentNode;
			}
		}
		return state$ || EMPTY;
	}

	static observers = new Map();
	static instances = new Map();
	static factories = new Map();
	static states = new Map();

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
				} catch (_) {
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
		const selectors = factories.map((factory) => (Array.isArray(factory) ? factory[2] : factory.meta.selector));
		const match = function(node) {
			selectors.forEach(function(selector, i) {
				if (node.matches(selector)) {
					if (!results.has(node)) {
						results.set(node, []);
					}
					results.get(node).push({ factory: factories[i] });
				}
			});
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
		return results;
	}

	static register$(factories, target = document) {
		if (this.instances.has(target)) {
			throw ('node already registered');
			// Component.unregister(target);
		}
		const instances = [];
		this.instances.set(target, instances);
		const instances$ = new Subject();
		let results;
		results = Component.matches(factories, target);
		const observingNodes = Array.from(results.keys());
		const initialize = (node) => {
			if (results.has(node)) {
				const tuples = results.get(node);
				tuples.forEach(tuple => {
					this.getFactory(tuple.factory).then(factory => {
						const instance = new factory.prototype.constructor(node);
						instances.push(instance);
						instances$.next(instances.slice());
					});
				});
			}
		};
		if ('IntersectionObserver' in window) {
			const observerOptions = {
				root: target,
				rootMargin: '50px',
				threshold: [0.01, 0.99],
			};
			const observer = new IntersectionObserver((entries, observer) => {
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
			instances.forEach(instance => instance.destroy());
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
