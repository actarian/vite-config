
import { Component } from '../../core/component/component';

export class ForComponent extends Component {

	updateItems(items = []) {
		const node = this.clonedNode;
		const tokens = this.tokens;
		const isArray = Array.isArray(items);
		const array = isArray ? items : Object.keys(items);
		const total = array.length;
		const previous = this.nodes.length;
		const end = Math.max(previous, total);
		// console.log('updateItems', this.tokens, items, previous, total, array);
		for (let i = 0; i < end; i++) {
			if (i < total) {
				const key = isArray ? i : array[i];
				const value = isArray ? array[key] : items[key];
				if (i < previous) {
					// update
					const state = this.states[i];
					state[tokens.key] = key;
					state[tokens.value] = value;
				} else {
					// create
					const clonedNode = node.cloneNode(true);
					const state = Component.newState(clonedNode);
					state[tokens.key] = key;
					state[tokens.value] = value;
					this.ref.parentNode.insertBefore(clonedNode, this.ref);
					// const args = [tokens.key, key, tokens.value, value, i, total];
					// console.log(args);
					// const skipSubscription = true;
					window.registerApp$(clonedNode).subscribe(
						// instances => { }
					);
					this.nodes.push(clonedNode);
					this.states.push(state);
					// console.log('updateItems.create', i, state);
				}
			} else {
				// remove
				const clonedNode = this.nodes[i];
				clonedNode.remove();
				Component.unregister(clonedNode);
			}
		}
		this.nodes.length = array.length;
		this.states.length = array.length;
	}

	onInit() {
		this.clonedNode = this.node.cloneNode(true);
		this.clonedNode.removeAttribute('xfor');
		this.clonedNode.removeAttribute('data-for');
		const ref = this.ref = document.createComment('for');
		const node = this.node;
		this.node = ref;
		this.template = node;
		node.before(ref);
		const tokens = this.tokens = ForComponent.getEachExpressionTokens(node.dataset.for || node.getAttribute('xfor'));
		node.remove();
		// {key: 'index', value: 'item', iterable: 'items'}
		// console.log(tokens);
		this.nodes = [];
		this.states = [];
		const getValue = Component.getExpression(tokens.iterable);
		this.state$.subscribe(state => {
			const items = getValue(state);
			this.updateItems(items);
		});
	}

	static getEachExpressionTokens(expression) {
		if (expression === null) {
			throw new Error('invalid each');
		}
		if (expression.trim().indexOf('let ') === -1 || expression.trim().indexOf(' of ') === -1) {
			throw new Error('invalid each');
		}
		const expressions = expression.split(';').map(x => x.trim()).filter(x => x !== '');
		const eachExpressions = expressions[0].split(' of ').map(x => x.trim());
		let value = eachExpressions[0].replace(/\s*let\s*/, '');
		const iterable = eachExpressions[1];
		let key = 'index';
		const keyValueMatches = value.match(/\[(.+)\s*,\s*(.+)\]/);
		if (keyValueMatches) {
			key = keyValueMatches[1];
			value = keyValueMatches[2];
		}
		if (expressions.length > 1) {
			const indexExpressions = expressions[1].split(/\s*let\s*|\s*=\s*index/).map(x => x.trim());
			if (indexExpressions.length === 3) {
				key = indexExpressions[1];
			}
		}
		return { key, value, iterable };
	}

	static meta = {
		selector: '[data-for],[xfor]',
	};

}
