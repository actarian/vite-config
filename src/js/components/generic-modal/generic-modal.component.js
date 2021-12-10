import { fromEvent, takeUntil, tap } from 'rxjs';
import { Component } from '../../common/component/component';
import { ModalService } from '../../common/modal/modal.service';

export class GenericModalComponent extends Component {

	onInit() {
		const button = this.node.querySelector('.btn--close');
		if (button) {
			fromEvent(button, 'click').pipe(
				tap(event => ModalService.reject()),
				takeUntil(this.unsubscribe$),
			).subscribe();
		}
	}

	static meta = {
		selector: '[generic-modal]',
	};

}
