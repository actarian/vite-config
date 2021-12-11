import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { Component } from '../../core/component/component';
import { EventService } from './event.service';

const EVENTS = ['event', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'mousedown', 'mouseup', 'mousemove', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];

export class EventComponent extends Component {

	onInit() {
		// console.log('EventComponent.onInit');
		this.event$().pipe(
			takeUntil(this.unsubscribe$),
		).subscribe();
	}

	event$() {
		const node = this.node;
		const events = EVENTS.filter(x => node.dataset[x] || node.hasAttribute(x));
		return merge(...events.map(event => {
			const eventName = event === 'event' ? 'click' : event;
			return fromEvent(node, eventName).pipe(
				tap(originalEvent => {
					const eventType = node.dataset[event] || node.getAttribute(event) || 'event';
					const eventData = node.getAttribute('event-data') !== '' ? JSON.parse(node.getAttribute('event-data')) : null;
					EventService.send(eventType, eventData, node, originalEvent);
				}),
			);
		}));
	}

	static meta = {
		selector: `[data-${EVENTS.join('],[')}],[${EVENTS.join('],[')}]`,
	};
}
