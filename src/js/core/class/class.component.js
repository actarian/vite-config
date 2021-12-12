import { takeUntil } from 'rxjs';
import { Component } from '../../core/component/component';

export function ClassComponent(node, unsubscribe$) {
	const initialKeys = [];
	Array.prototype.slice.call(node.classList).forEach((value) => {
		initialKeys.push(value);
	});
	const getValue = Component.getExpression(node.dataset.class || node.getAttribute('xclass'));
	const state$ = Component.getState$(node);
	state$.pipe(
		takeUntil(unsubscribe$),
	).subscribe(state => {
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
		keys = keys.concat(initialKeys);
		node.setAttribute('class', keys.join(' '));
	});
}

ClassComponent.meta = {
	selector: `[data-class],[xclass]`,
};
