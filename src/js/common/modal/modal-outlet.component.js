
import { merge, takeUntil, tap } from 'rxjs';
import { Component } from '../../core/component/component';
import { EventService } from '../../core/event/event.service';
import './modal-outlet.component.scss';
import { ModalService } from './modal.service';

export class ModalOutletComponent extends Component {

	get modal() {
		return this.modal_;
	}

	get busy() {
		return this.busy_;
	}

	set busy(busy) {
		if (this.busy_ !== busy) {
			this.busy_ = busy;
			this.updateClassList();
		}
	}

	onInit() {
		this.lastModal_ = null;
		const node = this.node;
		node.innerHTML = /* html */ `
		<div class="modal-outlet__container">
			<div class="modal-outlet__background" data-event="close"></div>
			<div class="modal-outlet__modal"></div>
			<div class="spinner spinner--contrasted"></div>
		</div>
		`;
		this.modalNode = node.querySelector('.modal-outlet__modal');
		this.containerNode = node.querySelector('.modal-outlet__container');
		window.registerApp$(this.containerNode).subscribe(
			// instances => { }
		);
		this.listeners$().pipe(
			takeUntil(this.unsubscribe$)
		).subscribe();
		node.modalOutlet__ = this;
	}

	listeners$() {
		return merge(this.modal$(), this.busy$(), this.event$());
	}

	modal$() {
		return ModalService.modal$.pipe(
			tap(modal => {
				// console.log('ModalOutletComponent set modal', modal);
				const previousModal = this.modal_;
				if (previousModal && previousModal.node) {
					Component.unregister(previousModal.node);
				}
				this.modal_ = modal;
				if (modal && modal.node) {
					const lastModal = this.lastModal_;
					if (lastModal) {
						this.modalNode.removeChild(lastModal.node);
					}
					this.modalNode.appendChild(modal.node);
					window.registerApp$(modal.node).subscribe(
						// instances => { }
					);
					this.lastModal_ = modal;
					this.updateClassList();
				} else {
					this.updateClassList();
				}
			}),
		)
	}

	busy$() {
		return ModalService.busy$.pipe(
			tap(busy => this.busy = busy),
		)
	}

	event$() {
		// return EventService.bubble$(this.node).pipe(
		// filter(event => event.type === 'close'),
		return EventService.filter$(this.node, 'close').pipe(
			tap(_ => {
				// console.log('ModalOutletComponent.event$.close');
				ModalService.reject();
			}),
		)
	}

	getClassList() {
		const classList = {
			'modal-outlet__container': true,
			busy: this.busy_ === true,
			active: this.modal_ != null
		};
		const lastModal = this.lastModal_;
		if (lastModal) {
			classList[lastModal.modal.type] = true;
			classList[lastModal.modal.position] = true;
		}
		return Object.keys(classList).filter(key => classList[key] === true).join(' ');
	}

	updateClassList() {
		const classList = this.getClassList();
		this.containerNode.setAttribute('class', classList);
	}

	static getModalOutlet(node) {
		let modalOutlet = null;
		let parentNode = node.parentNode;
		while (parentNode) {
			if (parentNode.modalOutlet__) {
				modalOutlet = parentNode.modalOutlet__;
			}
			parentNode = modalOutlet ? null : parentNode.parentNode;
		}
		return modalOutlet;
	}

	static meta = {
		selector: '[data-modal-outlet]',
	};

}
