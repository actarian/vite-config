import { Component } from './common/component/component';

export class AppComponent extends Component {

	onInit() {
		console.log('AppComponent.onInit');
	}

	static meta = {
		selector: '[app]',
	};

}
