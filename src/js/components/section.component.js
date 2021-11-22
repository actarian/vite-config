import { Component } from '../common/component/component';

export class SectionComponent extends Component {

	onInit() {
		const time = Math.floor(performance.now() / 100) / 10;
		console.log('SectionComponent.onInit', time);
		this.node.querySelector('.section__time').innerHTML = `SectionComponent.onInit at ${time}s`;
		// this.node.querySelector('.section__time').innerHTML = RelativeDateService.getRelativeTime();
	}

	static meta = {
		selector: '[section]',
	};

}
