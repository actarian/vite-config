import { Subject } from 'rxjs';

const modules = import.meta.glob('../../modules/*.js');

export class Component {

	static observers = new Map();
	static subjects = new Map();
	static factories = new Map();

	static getFactory(meta) {
		return new Promise((resolve, reject) => {
			console.log(meta);
			if (meta.length === 2) {
				resolve(meta[0]);
			} else {
				const name = meta[0];
				if (this.factories.has(name)) {
					resolve(this.factories.get(name));
				} else {
					const src = meta[1];
					const key = Object.keys(modules).find(key => key.indexOf(src) !== -1);
					if (key) {
						const loader = modules[key];
						loader().then(module => {
							if (name in module) {
								const factory = module[name];
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
			}
		});
	}

	static register$(metas, target = document) {
		const subjects = [];
		this.subjects.set(target, subjects);
		const instances$ = new Subject();
		const observingNodes = [];
		const entries = metas.map(meta => {
			const selector = meta.length === 2 ? meta[1] : meta[2];
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
				meta,
				nodes: nodes,
			};
		}).filter(x => x.nodes.length > 0);
		const initialize = (node) => {
			const nodeEntries = entries.filter(x => x.nodes.indexOf(node) !== -1);
			nodeEntries.forEach(nodeEntry => {
				this.getFactory(nodeEntry.meta).then(factory => {
					if (factory.length === 2) {
						const subject = new Subject();
						factory(node, subject);
						subjects.push(subject);
						instances$.next(subjects.slice());
					} else {
						factory(node);
					}
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
		if (this.subjects.has(target)) {
			const subjects = this.subjects.get(target);
			subjects.forEach(subject => subject.next());
			this.subjects.delete(target);
		}
	}

	static registeredInstances(target = document) {
		if (this.subjects.has(target)) {
			const subjects = this.subjects.get(target);
			return subjects;
		} else {
			return [];
		}
	}

	static create(html) {
		const node = document.createElement('div');
		node.innerHTML = html;
		return node.firstElementChild;
	}

}
