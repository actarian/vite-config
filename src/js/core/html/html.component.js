import { takeUntil } from 'rxjs';
import { state$ } from '../state/state';

export function HtmlComponent(node, data, unsubscribe$, module) {
	const getValue = module.makeFunction(data.html);
	let innerHTML_;
	state$(node).pipe(
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
