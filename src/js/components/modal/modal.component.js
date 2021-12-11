// import { fromEvent, takeUntil, tap } from 'rxjs';
// import { ModalService } from '../../common/modal/modal.service';
import { Component } from '../../core/component/component';

export class ModalComponent extends Component {

	onInit() {
		console.log('I\'m a modal!');
		/*
		const button = this.node.querySelector('.btn--close');
		if (button) {
			fromEvent(button, 'click').pipe(
				tap(event => ModalService.reject()),
				takeUntil(this.unsubscribe$),
			).subscribe();
		}
		*/
	}

	static meta = {
		selector: '[data-modal]',
	};

}
