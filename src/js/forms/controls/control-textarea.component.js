


import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { getControl, updateControl } from './control.component';

export function ControlTextarea(node, data, unsubscribe$) {
	const control = getControl(node, data.field);
	const textarea = node.querySelector('textarea');

	if (control) {
		control.changes$.pipe(
			takeUntil(unsubscribe$),
		).subscribe((value) => {
			updateControl(node, control);
			textarea.disabled = control.flags.disabled;
			textarea.readOnly = control.flags.readonly;
			if (control.flags.touched && control.errors.length) {
				console.log('ControlTextarea.onChanged.error', control.errors.map(error => error.key));
			}
			if (textarea.value !== control.value) {
				textarea.value = control.value;
			}
		});

		listeners$().pipe(
			takeUntil(unsubscribe$),
		).subscribe();
	}

	function listeners$() {
		return merge(
			change$(),
			blur$(),
		)
	}

	function change$() {
		return merge(
			fromEvent(textarea, 'input'),
			fromEvent(textarea, 'change'),
		).pipe(
			tap(event => {
				control.patch(event.target.value);
			})
		);
	}

	function blur$() {
		return fromEvent(textarea, 'blur').pipe(
			tap(event => {
				control.touched = true;
			})
		);
	}
}

ControlTextarea.meta = {
	selector: '[data-control-textarea]',
}
