import { Component } from '../common/component/component';
import { RelativeDateService } from '../common/relative-date/relative-date.service';

export class SectionComponent extends Component {

	onInit() {
    console.log('SectionComponent.onInit');
    this.node.querySelector('.section__title').innerHTML = parseInt(performance.now());
    RelativeDateService.getRelativeTime();
	}

	static meta = {
		selector: '[section]',
	};

}
