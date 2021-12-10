import { fromEvent, merge, takeUntil, tap } from 'rxjs';
import { Component } from "../common/component/component";
import { environment } from '../environment';
import { ControlComponent } from "./controls/control.component";

export class FormsTestComponent extends Component {

	onInit() {
		if (environment.flags.production) {
			return;
		}
		const form = this.form = ControlComponent.getForm(this.node);
		if (!form) {
			return;
		}
		this.node.innerHTML = /*html*/`
			<code class="forms-test__code"[innerHTML]="form.value | json"></code>
			<button type="button" class="btn--submit"><span>Test</span></button>
			<button type="button" class="btn--reset"><span>Reset</span></button>
		`;
		const code = this.code = this.node.querySelector('.forms-test__code');
		this.listeners$().pipe(
			takeUntil(this.unsubscribe$),
		).subscribe();
	}

	listeners$() {
		return merge(
			this.change$(),
			this.test$(),
			this.reset$(),
		)
	}

	change$() {
		return this.form.changes$.pipe(
			tap(value => {
				this.code.innerText = JSON.stringify(value);
			}),
		)
	}

	test$() {
		const button = this.node.querySelector('.btn--submit');
		return fromEvent(button, 'click').pipe(
			tap(event => {
				const form = this.form;
				if (typeof form.test === 'function') {
					form.test();
				} else {
					const values = {};
					Object.keys(this.form.controls).forEach(key => {
						const control = this.form.controls[key];
						if (control.validators.length) {
							if (control.options) {
								values[key] = control.options.length > 1 ? control.options[1].id : null;
							} else {
								values[key] = key;
							}
						}
					});
					this.form.patch(values);
				}
			})
		);
	}

	reset$() {
		const button = this.node.querySelector('.btn--reset');
		return fromEvent(button, 'click').pipe(
			tap(event => {
				this.form.reset();
			})
		);
	}

	static meta = {
		selector: '[forms-test]',
	}
}
