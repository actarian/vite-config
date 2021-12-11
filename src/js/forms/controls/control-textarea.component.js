


import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { ControlComponent } from './control.component';

export class ControlTextarea extends ControlComponent {

	onControl(fieldName, control, form) {
		// console.log('ControlTextarea.onControl', fieldName, control, form);
		const textarea = this.textarea = this.node.querySelector('textarea');
		this.listeners$().pipe(
			takeUntil(this.unsubscribe$),
		).subscribe();
	}

	onChanged() {
		const textarea = this.textarea;
		const control = this.control;
		// console.log('ControlTextarea.onChanged');
		textarea.disabled = control.flags.disabled;
		textarea.readOnly = control.flags.readonly;
		if (control.flags.touched && control.errors.length) {
			console.log('ControlTextarea.onChanged.error', control.errors.map(error => error.key));
		}
		if (textarea.value !== control.value) {
			textarea.value = control.value;
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
			fromEvent(this.textarea, 'input'),
			fromEvent(this.textarea, 'change'),
		).pipe(
			tap(event => {
				this.control.patch(event.target.value);
			})
		);
	}

	focus$() {
		return fromEvent(this.textarea, 'focus').pipe(
			tap(event => {
				this.focus = true;
				this.onUpdate();
			})
		);
	}

	blur$() {
		return fromEvent(this.textarea, 'blur').pipe(
			tap(event => {
				this.focus = false;
				this.control.touched = true;
			})
		);
	}

	static meta = {
		selector: '[data-control-textarea]',
	};

}
