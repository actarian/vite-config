import { Subject } from 'rxjs';

const modules = import.meta.glob('../../modules/*.js');

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
		Component.instances.forEach(instances => {
			const index = instances.indexOf(this);
			if (index !== -1) {
				instances.splice(index, 1);
			}
		});
	}

	static create(html) {
		const node = document.createElement('div');
		node.innerHTML = html;
		return node.firstElementChild;
	}

	static observers = new Map();
	static instances = new Map();
	static factories = new Map();

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

	static register$(factories, target = document) {
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
			const nodes = Array.prototype.slice.call(target.querySelectorAll(selector));
			if ('matches' in target && target.matches(selector)) {
				nodes.push(target);
			}
			nodes.forEach(node => {
				if (observingNodes.indexOf(node) === -1) {
					observingNodes.push(node);
				}
			});
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
