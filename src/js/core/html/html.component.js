import { takeUntil } from 'rxjs';
import { Component } from '../../core/component/component';

export function HtmlComponent(node, unsubscribe$) {
	const getValue = Component.getExpression(node.dataset.html || node.getAttribute('xhtml'));
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
	selector: `[data-html],[xhtml]`,
};
