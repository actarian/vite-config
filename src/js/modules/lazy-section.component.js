import { Component } from '../common/component/component';
import './lazy-section.component.scss';

export class LazySectionComponent extends Component {

	onInit() {
		const time = Math.floor(performance.now() / 100) / 10;
		console.log('LazySectionComponent.onInit', time);
		this.node.querySelector('.section__time').innerHTML = `LazySectionComponent.onInit at ${time}s`;
		// this.node.querySelector('.section__time').innerHTML = RelativeDateService.getRelativeTime();
	}

}
