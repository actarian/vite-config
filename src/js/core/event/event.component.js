import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { EventService } from './event.service';

const EVENTS = ['event', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'mousedown', 'mouseup', 'mousemove', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];

export function EventComponent(node, unsubscribe$) {
	function event$() {
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
	event$().pipe(
		takeUntil(unsubscribe$),
	).subscribe();
}

EventComponent.meta = {
	selector: `[data-${EVENTS.join('],[')}],[${EVENTS.join('],[')}]`,
};
