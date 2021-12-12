// import { fromEvent, takeUntil, tap } from 'rxjs';

export function ModalComponent(node, unsubscribe$) {
	console.log('I\'m a modal!');
	/*
	const button = node.querySelector('.btn--close');
	if (button) {
		fromEvent(button, 'click').pipe(
			tap(event => ModalService.reject()),
			takeUntil(unsubscribe$),
		).subscribe();
	}
	*/
}

ModalComponent.meta = {
	selector: '[data-modal]',
};
