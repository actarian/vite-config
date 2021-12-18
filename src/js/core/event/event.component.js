import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { getParentState, getState } from '../state/state';
import { EventService } from './event.service';

const EVENTS = ['event', 'click', 'dblclick', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'mousedown', 'mouseup', 'mousemove', 'contextmenu', 'touchstart', 'touchmove', 'touchend', 'keydown', 'keyup', 'input', 'change', 'loaded'];

export function EventComponent(node, data, unsubscribe$, module) {

	event$().pipe(
		takeUntil(unsubscribe$),
	).subscribe();

	function event$() {
		const events = EVENTS.filter(x => data[x]);
		return merge(...events.map(event => {
			const eventName = event === 'event' ? 'click' : event;
			return fromEvent(node, eventName).pipe(
				tap(originalEvent => {
					if (event === 'event') {
						const eventType = data[event] || 'event';
						const eventData = node.getAttribute('event-data') !== '' ? JSON.parse(node.getAttribute('event-data')) : null;
						EventService.send(eventType, eventData, node, originalEvent);
					} else {
						const expression = data[event];
						const getValue = module.makeFunction(expression);
						const parentState = getParentState(node);
						const state = getState(node);
						const mixedState = { ...parentState, ...state };
						const value = getValue(mixedState);
						// console.log('mixedState', mixedState, 'parentState', parentState, 'state', state);
					}
				}),
			);
		}));
	}
}

EventComponent.meta = {
	selector: `[data-${EVENTS.join('],[data-')}]`,
};
