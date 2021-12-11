import { first, takeUntil, tap } from 'rxjs';
import { ModalService } from './common/modal/modal.service';
import { Component } from './core/component/component';
import { EventService } from './core/event/event.service';

export class AppComponent extends Component {

	onInit() {
		// console.log('AppComponent.onInit');
		this.randomItems();
		this.modal$().pipe(
			takeUntil(this.unsubscribe$),
		).subscribe();
	}

	randomItems() {
		const count = 5 + Math.floor(Math.random() * 40);
		this.state.items = new Array(count).fill(0).map((x, i) => {
			return { title: String.fromCharCode(65 + i) };
		});
	}

	modal$() {
		// return EventService.bubble$(this.node).pipe(
		// return EventService.event$.pipe(
		// filter(event => event.type === 'modal'),
		return EventService.bubble$(this.node).pipe(
			tap(event => {
				switch (event.type) {
					case 'modal':
						ModalService.open$({ src: '/vite-config/modal.html' }).pipe(
							first(),
							takeUntil(this.unsubscribe$)
						).subscribe(event => {
							// console.log(event);
						});
						break;
					case 'random':
						this.randomItems();
						break;
				}
			}),
		);
	}

	static meta = {
		selector: '[data-app]',
	};

}
