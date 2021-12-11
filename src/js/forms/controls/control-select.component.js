


import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { ControlComponent } from './control.component';

export class ControlSelect extends ControlComponent {

	onControl(fieldName, control, form) {
		// console.log('ControlSelect.onControl', fieldName, control, form);
		const select = this.select = this.node.querySelector('select');
		this.listeners$().pipe(
			takeUntil(this.unsubscribe$),
		).subscribe();
	}

	onChanged() {
		const select = this.select;
		const control = this.control;
		// console.log('ControlSelect.onChanged');
		select.disabled = control.flags.disabled;
		select.readOnly = control.flags.readonly;
		if (control.flags.touched && control.errors.length) {
			console.log('ControlSelect.onChanged.error', control.errors.map(error => error.key));
		}
		if (select.value !== control.value) {
			select.value = control.value;
		}
	}

	listeners$() {
		return merge(
			this.change$(),
			this.focus$(),
			this.blur$(),
		)
	}

	change$() {
		return fromEvent(this.select, 'change').pipe(
			tap(event => {
				this.control.patch(event.target.value);
			})
		);
	}

	focus$() {
		return fromEvent(this.select, 'focus').pipe(
			tap(event => {
				this.focus = true;
				this.onUpdate();
			})
		);
	}

	blur$() {
		return fromEvent(this.select, 'blur').pipe(
			tap(event => {
				this.focus = false;
				this.control.touched = true;
			})
		);
	}

	static meta = {
		selector: '[data-control-select]',
	};

}
