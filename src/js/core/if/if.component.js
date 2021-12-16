
import { takeUntil } from 'rxjs';
import { Component } from '../../core/component/component';

export function IfComponent(node, data, unsubscribe$, originalNode) {
	delete originalNode.dataset.if;
	const template = originalNode;
	// const originalNode = node.cloneNode(true);
	const getValue = Component.getExpression(data.if);
	const ref = document.createComment('if');
	node.parentNode.replaceChild(ref, node);
	let flag_;
	let clonedNode;
	const state$ = Component.getState$(ref);
	state$.pipe(
		takeUntil(unsubscribe$),
	).subscribe(state => {
		const flag = getValue(state);
		if (flag_ !== flag) {
			flag_ = flag;
			if (flag) {
				clonedNode = template.cloneNode(true);
				ref.after(clonedNode);
				window.registerApp$(clonedNode).subscribe(
					// instances => { }
				);
			} else {
				if (clonedNode) {
					clonedNode.remove();
					clonedNode = null;
				}
				Component.unregister(template);
			}
		}
	});
}

IfComponent.meta = {
	selector: '[data-if]',
	structure: true,
}
