import { takeUntil } from 'rxjs';
import { Component } from '../../core/component/component';

export function StyleComponent(node, data, unsubscribe$) {
	const getValue = Component.getExpression(data.style);
	let previousStyle;
	const state$ = Component.getState$(node);
	state$.pipe(
		takeUntil(unsubscribe$),
	).subscribe(state => {
		const style = getValue(state);
		if (previousStyle) {
			for (let key in previousStyle) {
				if (!style || !style[key]) {
					const splitted = key.split('.');
					const propertyName = splitted.shift();
					node.style.removeProperty(propertyName);
				}
			}
		}
		if (style) {
			for (let key in style) {
				if (!previousStyle || previousStyle[key] !== style[key]) {
					const splitted = key.split('.');
					const propertyName = splitted.shift();
					const value = style[key] + (splitted.length ? splitted[0] : '');
					node.style.setProperty(propertyName, value);
				}
			}
		}
		previousStyle = style;
	});
}

StyleComponent.meta = {
	selector: `[data-style]`,
};
