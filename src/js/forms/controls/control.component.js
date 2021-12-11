


import { takeUntil } from 'rxjs';
import { Component } from '../../core/component/component';
import { mapErrors_ } from '../helpers/helpers';

export class ControlComponent extends Component {

	onInit() {
		const fieldName = this.fieldName = ControlComponent.getField(this.node);
		if (fieldName === '') {
			return;
		}
		const form = this.form = ControlComponent.getForm(this.node);
		if (!form) {
			return;
		}
		const control = this.control = form.get(fieldName);
		if (!control) {
			return;
		}
		this.focus = false;
		this.classList = Array.from(this.node.classList);
		this.onControl(fieldName, control, form);
		control.changes$.pipe(
			takeUntil(this.unsubscribe$),
		).subscribe((value) => {
			this.onUpdate();
			this.onChanged();
		});
	}

	onControl(fieldName, control, form) {
		console.log('ControlComponent.onControl', fieldName, control, form);
	}

	onUpdate() {
		// console.log('ControlComponent.onUpdate');
		const node = this.node;
		const control = this.control;
		const focus = this.focus;
		const flags = this.flags = control.flags;
		const errors = this.errors = mapErrors_(control.errors);
		let classList = { ...flags, value: ControlComponent.hasValue(control), focus, required: control.validators.length > 0 };
		classList = this.classList.concat(Object.keys(classList).filter(key => classList[key] === true), errors.filter(kv => kv.value != null).map(kv => `error--${kv.key}`));
		node.setAttribute('class', classList.join(' '));
		/*
		const classListAdd = Object.keys(classList).filter(key => classList[key] === true).concat(errors.filter(kv => kv.value != null).map(kv => `error--${kv.key}`));
		const classListRemove = Object.keys(classList).filter(key => classList[key] === false).concat(errors.filter(kv => kv.value == null).map(kv => `error--${kv.key}`));
		node.classList.add(...classListAdd);
		node.classList.remove(...classListRemove);
		*/
	}

	onChanged() {
		console.log('ControlComponent.onChanged');
	}

	static hasValue(control) {
		return control.value != null && control.value != '';
	}

	static getField(node) {
		return node.getAttribute('data-field');
	}

	static getForm(node) {
		let form = null;
		let parentNode = node.parentNode;
		while (parentNode) {
			if (parentNode.form) {
				form = parentNode.form;
			}
			parentNode = form ? null : parentNode.parentNode;
		}
		return form;
	}

	static meta = {
		selector: '[data-control]',
	};
}
