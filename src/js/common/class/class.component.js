import { Component } from '../component/component';

export class ClassComponent extends Component {

	onInit() {
		const node = this.node;
		const initialKeys = this.initialKeys = [];
		Array.prototype.slice.call(node.classList).forEach((value) => {
			initialKeys.push(value);
		});
		const getValue = Component.getExpression(node.getAttribute('xclass') || node.getAttribute('data-class'));
		this.state$.subscribe(state => {
			const value = getValue(state);
			let keys = [];
			if (typeof value === 'object') {
				for (let key in value) {
					if (value[key]) {
						keys.push(key);
					}
				}
			} else if (typeof value === 'string') {
				keys = value.split(/\s+/);
			}
			keys = keys.concat(this.initialKeys);
			node.setAttribute('class', keys.join(' '));
		});
	}

	static meta = {
		selector: `[xclass],[data-class]`,
	};
}
