import { filter, Subject } from 'rxjs';

export class EventService {

	static event$ = new Subject();

	static send(type, data, node, event) {
		EventService.event$.next({ type, data, node, event });
	}

	static bubble$(node) {
		return this.event$.pipe(
			// tap(event => console.log(event.node, node, node.contains(event.node))),
			filter(event => event.node && node.contains(event.node)),
		)
	}

	static filter$(node, events) {
		events = Array.isArray(events) ? events : [events];
		return this.event$.pipe(
			// tap(event => console.log(event.node, node, node.contains(event.node))),
			filter(event => events.indexOf(event.type) !== -1 && event.node && node.contains(event.node)),
		)
	}

}
