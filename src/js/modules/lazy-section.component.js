import { Component } from '../common/component/component';
import { RelativeDateService } from '../common/relative-date/relative-date.service';
import './lazy-section.component.scss';

export class LazySectionComponent extends Component {

  onInit() {
    console.log('LazySectionComponent.onInit');
    this.node.querySelector('.section__title').innerHTML = parseInt(performance.now());
    RelativeDateService.getRelativeTime();
	}

}
