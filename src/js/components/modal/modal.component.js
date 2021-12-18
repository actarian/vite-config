import { getState } from '../../core/state/state';

export function ModalComponent(node, data, unsubscribe$) {
	const state = getState(node);
	if (state) {
		console.log('ModalComponent.state', state);
	}
}

ModalComponent.meta = {
	selector: '[data-modal]',
};
