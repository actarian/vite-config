


import { fromEvent, tap } from 'rxjs';
import { ControlText } from './control-text.component';

export class ControlCheckbox extends ControlText {

	static meta = {
		selector: '[control-checkbox]',
	};

	onChanged() {
		const input = this.input;
		const control = this.control;
		// console.log('ControlText.onChanged');
		input.disabled = control.flags.disabled;
		input.readOnly = control.flags.readonly;
		if (control.flags.touched && control.errors.length) {
			console.log('ControlText.onChanged.error', control.errors.map(error => error.key));
		}
		const checked = control.value === true;
		if (input.checked !== checked) {
			input.checked = checked;
		}
	}

	change$() {
		return fromEvent(this.input, 'change').pipe(
			tap(event => {
				this.control.patch(event.target.checked);
			})
		);
	}

}
