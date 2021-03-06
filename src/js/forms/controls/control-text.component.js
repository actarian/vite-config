import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { getControl, updateControl } from './control.component';

export function ControlText(node, data, unsubscribe$) {
	const control = getControl(node, data.field);
	const input = node.querySelector('input');

	if (control) {
		control.changes$.pipe(
			takeUntil(unsubscribe$),
		).subscribe((value) => {
			updateControl(node, control);
			input.disabled = control.flags.disabled;
			input.readOnly = control.flags.readonly;
			if (control.flags.touched && control.errors.length) {
				console.log('ControlText.onChanged.error', control.errors.map(error => error.key));
			}
			if (input.value !== control.value) {
				input.value = control.value;
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
			fromEvent(input, 'input'),
			fromEvent(input, 'change'),
		).pipe(
			tap(event => {
				control.patch(event.target.value);
			})
		);
	}

	function blur$() {
		return fromEvent(input, 'blur').pipe(
			tap(event => {
				control.touched = true;
			})
		);
	}
}

ControlText.meta = {
	selector: '[data-control-text]',
}
