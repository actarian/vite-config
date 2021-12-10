


import { first, fromEvent, map, takeUntil } from 'rxjs';
import { Component } from '../../common/component/component';
import { FormControl, FormGroup, Validators } from '../../forms/forms';
// import { ContactsService } from './contacts.service';

export const FormStrategy = {
	InferData: 'infer',
	ApiData: 'api',
}

export class ContactsForm extends Component {

	onInit() {
		const strategy = this.strategy = this.node.getAttribute('strategy') || FormStrategy.InferData;
		this.error = null;
		this.success = false;
		this.state.error = true;
		this.state.mode = 'idle';
		const form = this.form = new FormGroup({
			firstName: new FormControl(null, [Validators.RequiredValidator()]),
			lastName: new FormControl(null, [Validators.RequiredValidator()]),
			email: new FormControl(null, [Validators.RequiredValidator(), Validators.EmailValidator()]),
			telephone: new FormControl(null),
			job: new FormControl(null),
			company: new FormControl(null),
			city: new FormControl(null, [Validators.RequiredValidator()]),
			country: new FormControl(null, [Validators.RequiredValidator()]),
			requestType: new FormControl(null, [Validators.RequiredValidator()]),
			message: new FormControl(null),
			privacy: new FormControl(null, [Validators.RequiredTrueValidator()]),
			newsletter: new FormControl(null, [Validators.RequiredValidator()]),
			commercial: new FormControl(null, [Validators.RequiredValidator()]),
			promotion: new FormControl(null, [Validators.RequiredValidator()]),
			checkRequest: window.antiforgery,
			checkField: '',
		});
		const controls = this.controls = form.controls;
		/*
		form.changes$.pipe(
			takeUntil(this.unsubscribe$)
		).subscribe((value) => {
			const flags = form.flags;
			const errors = mapErrors_(form.errors);
			console.log(value, flags, errors);
		});
		*/
		if (strategy === FormStrategy.InferData) {
			this.inferData();
		} else {
			this.loadData$().pipe(
				first(),
			).subscribe();
		}
		/*
		this.form = new FormGroup({
			hidden: new FormControl('hidden', [], { hidden: true }), // Validators.PatternValidator(/^\d+$/),
			disabled: new FormControl('disabled', [], { disabled: true }), // Validators.PatternValidator(/^\d+$/),
			readonly: new FormControl('readonly', [], { readonly: true }), // Validators.PatternValidator(/^[a-zA-Z0-9]{3}$/),
			required: new FormControl(null, [Validators.RequiredValidator()]),
			group: new FormGroup({
				a: null,
				b: null,
			}),
			array: new FormArray([null, null]),
		});
		this.form.changes$.pipe(
			map(value => (
				{ value, flags, errors: mapErrors_(this.form.errors) }
			)),
		).subscribe(data => {
			console.log(data);
		});
		*/
		fromEvent(this.node, 'submit').pipe(
			map(event => this.onSubmit(event)),
			takeUntil(this.unsubscribe$),
		).subscribe();
		// !!! expose form
		form.test = () => {
			this.test();
		};
		this.node.form = form;
	}

	inferData() {
		const selects = Array.prototype.slice.call(this.node.querySelectorAll('select'));
		selects.forEach(select => {
			const key = select.getAttribute('name');
			const control = this.form.get(key);
			if (control) {
				const options = Array.prototype.slice.call(select.querySelectorAll('option')).map(option => {
					return { id: option.value || null, name: option.innerText };
				});
				control.options = options;
			}
		});
	}

	loadData$() {
		/*
		return ContactsService.data$().pipe(
			tap(data => {
				const controls = this.controls;
				console.log(data, controls);
				// controls.country.options = FormService.toSelectOptions(data.country.options);
			}),
		);
		*/
	}

	onSubmit(event) {
		const form = this.form;
		// console.log('ContactsForm.onSubmit', form.value);
		if (form.flags.valid) {
			console.log('ContactsForm.onSubmit.valid!');
		} else {
			event.preventDefault();
			form.touched = true;
			const invalids = Array.prototype.slice.call(this.node.querySelectorAll('.invalid'));
			if (invalids.length) {
				const target = invalids[0];
				const scrollToY = target.getBoundingClientRect().top + window.scrollY - 100;
				window.scrollTo(0, scrollToY);
			}
		}
		/*
		const form = this.form;
		console.log('ContactsComponent.onSubmit', form.value);
		// console.log('ContactsComponent.onSubmit', 'form.valid', valid);
		if (form.valid) {
			// console.log('ContactsComponent.onSubmit', form.value);
			form.submitted = true;
			ContactsService.submit$(form.value).pipe(
				first(),
			).subscribe(_ => {
				this.success = true;
				form.reset();
				GtmService.push({
					'event': "Contact",
					'form_name': "Contatti"
				});
				if (form.value.newsletter) {
					GtmService.push({
						'event': "ContactNewsletter",
						'form_name': "ContattiNewsletter"
					});
				}
			}, error => {
				console.log('ContactsComponent.error', error);
				this.error = error;
				this.pushChanges();
				LocomotiveScrollService.update();
			});
		} else {
			form.touched = true;
		}
		*/
	}

	test() {
		const form = this.form;
		const controls = this.controls;
		const country = controls.country.options.length > 1 ? controls.country.options[1].id : null;
		const requestType = controls.requestType.options.length > 1 ? controls.requestType.options[1].id : null;
		form.patch({
			firstName: 'Jhon',
			lastName: 'Appleseed',
			email: 'jhonappleseed@gmail.com',
			telephone: '0721 411112',
			job: 'Web Developer',
			company: 'Websolute',
			city: 'Pesaro',
			country: country,
			requestType: requestType,
			message: 'Hi!',
			privacy: true,
			newsletter: false,
			commercial: false,
			promotion: false,
			checkRequest: window.antiforgery,
			checkField: ''
		});
	}

	static meta = {
		selector: '[contacts-form]',
	};

}
