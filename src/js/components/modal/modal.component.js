import { Component } from '../../core/component/component';

export function ModalComponent(node, data, unsubscribe$) {
	const state = Component.getState(node);
	if (state) {
		console.log('ModalComponent.state', state);
	}
}

ModalComponent.meta = {
	selector: '[data-modal]',
};
