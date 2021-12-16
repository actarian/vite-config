import { takeUntil } from 'rxjs';
import { Component } from '../../core/component/component';

export function HtmlComponent(node, data, unsubscribe$) {
	const getValue = Component.getExpression(data.html);
	let innerHTML_;
	const state$ = Component.getState$(node);
	state$.pipe(
		takeUntil(unsubscribe$),
	).subscribe(state => {
		const innerHTML = getValue(state);
		if (innerHTML_ !== innerHTML) {
			innerHTML_ = innerHTML;
			node.innerHTML = innerHTML == undefined ? '' : innerHTML; // !!! keep == loose equality
		}
	});
}

HtmlComponent.meta = {
	selector: `[data-html]`,
};
