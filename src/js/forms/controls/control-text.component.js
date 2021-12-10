import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { ControlComponent } from './control.component';

export class ControlText extends ControlComponent {

	onControl(fieldName, control, form) {
		// console.log('ControlText.onControl', fieldName, control, form);
		const input = this.input = this.node.querySelector('input');
		this.listeners$().pipe(
			takeUntil(this.unsubscribe$),
		).subscribe();
	}

	onChanged() {
		const input = this.input;
		const control = this.control;
		// console.log('ControlText.onChanged');
		input.disabled = control.flags.disabled;
		input.readOnly = control.flags.readonly;
		if (control.flags.touched && control.errors.length) {
			console.log('ControlText.onChanged.error', control.errors.map(error => error.key));
		}
		if (input.value !== control.value) {
			input.value = control.value;
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
		return merge(
			fromEvent(this.input, 'input'),
			fromEvent(this.input, 'change'),
		).pipe(
			tap(event => {
				this.control.patch(event.target.value);
			})
		);
	}

	focus$() {
		return fromEvent(this.input, 'focus').pipe(
			tap(event => {
				this.focus = true;
				this.onUpdate();
			})
		);
	}

	blur$() {
		return fromEvent(this.input, 'blur').pipe(
			tap(event => {
				this.focus = false;
				this.control.touched = true;
			})
		);
	}

	static meta = {
		selector: '[control-text]',
	};

}
