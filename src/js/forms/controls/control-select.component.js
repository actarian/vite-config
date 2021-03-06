


import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { getControl, updateControl } from './control.component';

export function ControlSelect(node, data, unsubscribe$) {
	const control = getControl(node, data.field);
	const select = node.querySelector('select');

	if (control) {
		control.changes$.pipe(
			takeUntil(unsubscribe$),
		).subscribe((value) => {
			updateControl(node, control);
			select.disabled = control.flags.disabled;
			select.readOnly = control.flags.readonly;
			if (control.flags.touched && control.errors.length) {
				console.log('ControlSelect.onChanged.error', control.errors.map(error => error.key));
			}
			if (select.value !== control.value) {
				select.value = control.value;
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
			fromEvent(select, 'input'),
			fromEvent(select, 'change'),
		).pipe(
			tap(event => {
				control.patch(event.target.value);
			})
		);
	}

	function blur$() {
		return fromEvent(select, 'blur').pipe(
			tap(event => {
				control.touched = true;
			})
		);
	}
}

ControlSelect.meta = {
	selector: '[data-control-select]',
}
