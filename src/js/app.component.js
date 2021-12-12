import { first, takeUntil, tap } from 'rxjs';
import { ModalService } from './common/modal/modal.service';
import { Component } from './core/component/component';
import { EventService } from './core/event/event.service';

export function AppComponent(node, unsubscribe$) {
	// console.log('AppComponent.onInit');

	const state = Component.newState(node);

	function randomItems() {
		const count = 5 + Math.floor(Math.random() * 40);
		state.items = new Array(count).fill(0).map((x, i) => {
			return { title: String.fromCharCode(65 + i) };
		});
	}

	randomItems();

	function modal$() {
		// return EventService.bubble$(node).pipe(
		// return EventService.event$.pipe(
		// filter(event => event.type === 'modal'),
		return EventService.bubble$(node).pipe(
			tap(event => {
				switch (event.type) {
					case 'modal':
						ModalService.open$({ src: '/vite-config/modal.html' }).pipe(
							first(),
							takeUntil(unsubscribe$)
						).subscribe(event => {
							// console.log(event);
						});
						break;
					case 'random':
						randomItems();
						break;
				}
			}),
		);
	}

	modal$().pipe(
		takeUntil(unsubscribe$),
	).subscribe();

}

AppComponent.meta = {
	selector: '[data-app]',
}
