import { BehaviorSubject, EMPTY, Subject } from 'rxjs';

const modules = import.meta.glob('../../modules/*.js');

const noderef = new Map();

export class Component {

	constructor(node, selector) {
		this.node = node;
		this.selector = selector;
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

	onChanges() { }

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

	static matchesSplitted(factories, node = document) {
		const results = new Map();
		const tuples = [];
		factories.forEach((factory, i) => {
			const selector = Array.isArray(factory) ? factory[2] : factory.meta.selector;
			const selectors = selector.split(',').map((x) => x.trim());
			tuples.push(...selectors.map((selector) => ({ factory, selector })));
		});
		const match = function(node) {
			tuples.forEach(function(tuple) {
				if (node.matches(tuple.selector)) {
					if (!results.has(node)) {
						results.set(node, []);
					}
					results.get(node).push({ factory: tuple.factory, selector: tuple.selector });
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
		Component.stats(`matchesSplitted ${results.size}`);
		return results;
	}

	static matchesAttributes(factories, node = document) {
		const results = new Map();
		const tuples = [];
		factories.forEach((factory, i) => {
			const selector = Array.isArray(factory) ? factory[2] : factory.meta.selector;
			const selectors = selector.split(',').map((x) => x.replace(/\[|\]/g, '').trim());
			tuples.push(...selectors.map((selector) => ({ factory, selector })));
		});
		const match = function(node) {
			tuples.forEach(function(tuple) {
				if (node.hasAttribute(tuple.selector)) {
					if (!results.has(node)) {
						results.set(node, []);
					}
					results.get(node).push({ factory: tuple.factory, selector: tuple.selector });
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
		if ('hasAttribute' in node) {
			match(node);
		}
		matchNode(node.firstElementChild);
		Component.stats(`matchesAttributes ${results.size}`);
		return results;
	}

	static treeWalkerAttributes(factories, node = document) {
		const results = new Map();
		const tuples = [];
		factories.forEach((factory, i) => {
			const selector = Array.isArray(factory) ? factory[2] : factory.meta.selector;
			const selectors = selector.split(',').map((x) => x.replace(/\[|\]/g, '').trim());
			tuples.push(...selectors.map((selector) => ({ factory, selector })));
		});
		const match = function(node) {
			tuples.forEach(function(tuple) {
				if (node.hasAttribute(tuple.selector)) {
					if (!results.has(node)) {
						results.set(node, []);
					}
					results.get(node).push({ factory: tuple.factory, selector: tuple.selector });
				}
			});
		};
		if ('hasAttribute' in node) {
			match(node);
		}
		const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
		let next = treeWalker.nextNode();
		while (next) {
			match(next);
			next = treeWalker.nextNode();
		}
		Component.stats(`treeWalkerAttributes ${results.size}`);
		return results;
	}

	static treeWalkerMatches(factories, node = document) {
		const results = new Map();
		const tuples = [];
		factories.forEach((factory, i) => {
			const selector = Array.isArray(factory) ? factory[2] : factory.meta.selector;
			const selectors = selector.split(',').map((x) => x.trim());
			tuples.push(...selectors.map((selector) => ({ factory, selector })));
		});
		const match = function(node) {
			tuples.forEach(function(tuple) {
				if (node.matches(tuple.selector)) {
					if (!results.has(node)) {
						results.set(node, []);
					}
					results.get(node).push({ factory: tuple.factory, selector: tuple.selector });
				}
			});
		};
		if ('matches' in node) {
			match(node);
		}
		const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
		let next = treeWalker.nextNode();
		while (next) {
			match(next);
			next = treeWalker.nextNode();
		}
		Component.stats(`treeWalkerMatches ${results.size}`);
		return results;
	}

	static querySelectorAll(factories, node = document) {
		const results = new Map();
		const selectors = factories.map((factory) => (Array.isArray(factory) ? factory[2] : factory.meta.selector));
		selectors.forEach(function(selector, i) {
			const nodes = node.querySelectorAll(selector);
			nodes.forEach((node) => {
				if (!results.has(node)) {
					results.set(node, []);
				}
				results.get(node).push({ factory: factories[i], selector: selector });
			});
		});
		if ('matches' in node) {
			selectors.forEach(function(selector, i) {
				if (node.match(selector)) {
					if (!results.has(node)) {
						results.set(node, []);
					}
					results.get(node).push({ factory: factories[i], selector: selector });
				}
			});
		}
		Component.stats(`querySelectorAll ${results.size}`);
		return results;
	}

	static matchesUnsplitted(factories, node = document) {
		const results = new Map();
		const selectors = factories.map((factory) => (Array.isArray(factory) ? factory[2] : factory.meta.selector));
		const match = function(node) {
			selectors.forEach(function(selector, i) {
				if (node.matches(selector)) {
					if (!results.has(node)) {
						results.set(node, []);
					}
					results.get(node).push({ factory: factories[i], selector: selector });
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
		Component.stats(`matchesUnsplitted ${results.size}`);
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
		// results = Component.treeWalkerMatches(factories, target);
		// results = Component.matchesSplitted(factories, target);
		// results = Component.treeWalkerAttributes(factories, target);
		// results = Component.matchesAttributes(factories, target);
		results = Component.matchesUnsplitted(factories, target);
		// results = Component.querySelectorAll(factories, target);
		const observingNodes = Array.from(results.keys());
		const initialize = (node) => {
			if (results.has(node)) {
				const tuples = results.get(node);
				tuples.forEach(tuple => {
					this.getFactory(tuple.factory).then(factory => {
						const instance = new factory.prototype.constructor(node, tuple.selector);
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

	static register$_1(factories, target = document) {
		if (this.instances.has(target)) {
			throw ('node already registered');
			// Component.unregister(target);
		}
		const instances = [];
		this.instances.set(target, instances);
		const instances$ = new Subject();
		const tuples = this.match_1(factories, target);
		const observingNodes = tuples.map(x => x.node);
		const initialize = (node) => {

			tuples.forEach(tuple => {
				if (tuple.node === node) {
					this.getFactory(tuple.factory).then(factory => {
						const instance = new factory.prototype.constructor(node, tuple.match);
						instances.push(instance);
						instances$.next(instances.slice());
					});
				}
			});
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

	static register$_2(factories, target = document) {
		if (this.instances.has(target)) {
			throw ('node already registered');
			// Component.unregister(target);
		}
		const instances = [];
		this.instances.set(target, instances);
		const instances$ = new Subject();
		const observingNodes = [];
		const entries = factories.map(factory => {
			let selector;
			if (Array.isArray(factory)) {
				selector = factory[2];
			} else {
				selector = factory.meta.selector;
			}
			// !!! multiple selectors
			// const selectors = selector.split(',');
			// selectors.forEach(selector => {
			const nodes = Array.prototype.slice.call(target.querySelectorAll(selector));
			if ('matches' in target && target.matches(selector)) {
				nodes.push(target);
			}
			nodes.forEach(node => {
				if (observingNodes.indexOf(node) === -1) {
					observingNodes.push(node);
				}
			});
			// });
			return {
				factory,
				nodes: nodes,
			}
		}).filter(x => x.nodes.length > 0);
		const initialize = (node) => {
			const nodeEntries = entries.filter(x => x.nodes.indexOf(node) !== -1);
			nodeEntries.forEach(nodeEntry => {
				this.getFactory(nodeEntry.factory).then(factory => {
					const instance = new factory.prototype.constructor(node);
					instances.push(instance);
					instances$.next(instances.slice());
				});
			});
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
	/*
	get parentInstance() {
		let parentInstance = null;
		let parentNode = this.node.parentNode;
		while (!parentInstance && parentNode) {
			if (parentNode.ref) {
				parentInstance = parentNode.ref;
			} else {
				parentNode = parentNode.parentNode;
			}
		}
		return parentInstance;
	}
	*/

}
