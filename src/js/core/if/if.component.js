
import { takeUntil } from 'rxjs';
import { state$ } from '../state/state';

export function IfComponent(node, data, unsubscribe$, module, template) {
	delete template.dataset.if;
	// const template = node.cloneNode(true);
	const getValue = module.makeFunction(data.if);
	const ref = document.createComment('if');
	node.parentNode.replaceChild(ref, node);
	let flag_;
	let clonedNode;
	state$(ref).pipe(
		takeUntil(unsubscribe$),
	).subscribe(state => {
		const flag = getValue(state);
		if (flag_ !== flag) {
			flag_ = flag;
			if (flag) {
				clonedNode = template.cloneNode(true);
				ref.after(clonedNode);
				module.observe$(clonedNode).subscribe();
			} else {
				if (clonedNode) {
					clonedNode.remove();
					clonedNode = null;
				}
				module.unregister(template);
			}
		}
	});
}

IfComponent.meta = {
	selector: '[data-if]',
	structure: true,
}
