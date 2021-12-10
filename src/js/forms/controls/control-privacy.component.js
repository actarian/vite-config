import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { ControlComponent } from './control.component';

export class ControlPrivacy extends ControlComponent {

	onControl(fieldName, control, form) {
		// console.log('ControlPrivacy.onControl', fieldName, control, form);
		const inputs = this.inputs = Array.prototype.slice.call(this.node.querySelectorAll('input'));
		inputs.forEach((input, i) => {
			(control.value === true && i === 0) || (control.value === false && i === 1) ? input.setAttribute('checked', '') : input.removeAttribute('checked');
		});
		this.listeners$().pipe(
			takeUntil(this.unsubscribe$),
		).subscribe();
	}

	onChanged() {
		const inputs = this.inputs;
		const control = this.control;
		// console.log('ControlPrivacy.onChanged');
		inputs.forEach((input, i) => {
			input.disabled = control.flags.disabled;
			input.readOnly = control.flags.readonly;
			(control.value === true && i === 0) || (control.value === false && i === 1) ? input.setAttribute('checked', '') : input.removeAttribute('checked');
		});
		if (control.flags.touched && control.errors.length) {
			console.log('ControlText.onChanged.error', control.errors.map(error => error.key));
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
		return fromEvent(this.inputs, 'change').pipe(
			tap(event => {
				this.control.patch(event.target.value);
			})
		);
	}

	focus$() {
		return fromEvent(this.inputs, 'focus').pipe(
			tap(event => {
				this.focus = true;
				this.onUpdate();
			})
		);
	}

	blur$() {
		return fromEvent(this.inputs, 'blur').pipe(
			tap(event => {
				this.focus = false;
				this.control.touched = true;
			})
		);
	}

	static meta = {
		selector: '[control-privacy]',
	};

}
