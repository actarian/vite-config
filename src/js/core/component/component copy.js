import { Subject } from 'rxjs';

export class Component {

	constructor(node) {
		this.node = node;
		this.unsubscribe$ = new Subject();
		this.onInit();
	}

	onInit() { }

	onChanges() { }

	onDestroy() { }

	destroy() {
		this.unsubscribe$.next();
		this.onDestroy();
		this.node = null;
		this.unsubscribe$ = null;
	}

	static init(target = document) {
		const items = Array.prototype.slice.call(target.querySelectorAll(this.meta.selector)).map(node => new this.prototype.constructor(node));
		return items;
	}

	static create(html) {
		const node = document.createElement('div');
		node.innerHTML = html;
		return node.firstElementChild;
	}

	static instances = new Map();
	static entries = new Map();
	static observers = new Map();

	static getOrSetInstances(target) {
		if (this.instances.has(target)) {
			return this.instances.get(target);
		} else {
			const instances = [];
			this.instances.set(target, instances);
			return instances;
		}
	}

	static getOrSetEntries(target, factories) {
		const entries = factories.map(factory => {
			const nodes = Array.prototype.slice.call(target.querySelectorAll(factory.meta.selector));
			if ('matches' in target && target.matches(factory.meta.selector)) {
				nodes.push(target);
			}
			nodes.forEach(node => {
				if (observingElements.indexOf(node) === -1) {
					observingElements.push(node);
				}
			});
			return {
				factory,
				nodes: nodes,
			}
		}).filter(x => x.nodes.length > 0);
		if (this.entries.has(target)) {
			return this.entries.get(target).concat(entries);
		} else {
			this.entries.set(target, entries);
			return entries;
		}
	}

	static getOrSetObservers(target) {
		if ('IntersectionObserver' in window) {
			if (this.observers.has(target)) {
				return this.observers.get(target);
			} else {
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
				this.observers.set(target, observer);
				return observer;
			}
		} else {
			return null;
		}
	}

	static initialize(element, target) {
		let entries = this.entries.get(target);
		if (entries) {
			const instances = this.getOrSetInstances(target);
			entries = entries.filter(x => x.nodes.indexOf(element) !== -1);
			entries.forEach(entry => {
				const instance = new entry.factory.prototype.constructor(element);
				instances.push(instance);
				instances$.next(instances.slice());
			});
		}
	}

	static register$(factories, target = document) {
		const instances = this.getOrSetInstances(target);
		const instances$ = new Subject();
		const entries = this.getOrSetEntries(target, factories);
		const observingElements = [];
		const items = factories.map(factory => {
			const nodes = Array.prototype.slice.call(target.querySelectorAll(factory.meta.selector));
			if ('matches' in target && target.matches(factory.meta.selector)) {
				nodes.push(target);
			}
			nodes.forEach(node => {
				if (observingElements.indexOf(node) === -1) {
					observingElements.push(node);
				}
			});
			return {
				factory,
				nodes: nodes,
			}
		}).filter(x => x.nodes.length > 0);
		const initialize = (element) => {
			const tuples = items.filter(x => x.nodes.indexOf(element) !== -1);
			tuples.forEach(tuple => {
				const instance = new tuple.factory.prototype.constructor(element);
				instances.push(instance);
				instances$.next(instances.slice());
			});
		};
		const observer = this.getOrSetObservers(target);
		if (observer) {
			observingElements.forEach((element) => {
				observer.observe(element);
			});
		} else {
			observingElements.forEach((element) => {
				initialize(element);
			});
		}
		return instances$;
	}

	static unregister(target = document) {
		if (this.observers.has(target)) {
			const observer = this.observers.get(target);
			observer.disconnect();
		}
		if (this.instances.has(target)) {
			const instances = this.instances.get(target);
			instances.forEach(instance => instance.destroy());
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

	static meta = {
		selector: '[component]'
	}
}
