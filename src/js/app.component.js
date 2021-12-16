import { first, takeUntil, tap } from 'rxjs';
import { ModalService } from './common/modal/modal.service';
import { Component } from './core/component/component';
import { EventService } from './core/event/event.service';

export function AppComponent(node, data, unsubscribe$) {
	// console.log('AppComponent.onInit');

	const state = Component.newState(node, {
		onClick: (item) => {
			// console.log('AppComponent.onClick', item);
			openModal(`click event item ${item.title}`);
		},
	});

	randomItems();

	event$().pipe(
		takeUntil(unsubscribe$),
	).subscribe();

	function openModal(description) {
		ModalService.open$({ src: '/vite-config/modal.html', data: {
			title: 'I\'m a modal',
			description: description,
		} }).pipe(
			first(),
			takeUntil(unsubscribe$)
		).subscribe(event => {
			// console.log(event);
		});
	}

	function randomItems() {
		const count = 5 + Math.floor(Math.random() * 40);
		state.items = new Array(count).fill(0).map((x, i) => {
			return { title: String.fromCharCode(65 + i) };
		});
	}

	function event$() {
		// return EventService.event$.pipe(
		// filter(event => event.type === 'modal'),
		return EventService.bubble$(node).pipe(
			tap(event => {
				console.log('AppComponent.event$', event.type);
				switch (event.type) {
					case 'modal':
						openModal('Hello world!');
						break;
					case 'random':
						randomItems();
						break;
				}
			}),
		);
	}

}

AppComponent.meta = {
	selector: '[data-app]',
}
