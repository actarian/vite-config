import { Component } from '../../core/component/component';

export class HtmlComponent extends Component {

	set innerHTML(innerHTML) {
		if (this.innerHTML_ !== innerHTML) {
			this.innerHTML_ = innerHTML;
			const node = this.node;
			node.innerHTML = innerHTML == undefined ? '' : innerHTML; // !!! keep == loose equality
		}
	}
	get innerHTML() {
		return this.innerHTML_;
	}

	onInit() {
		const node = this.node;
		const getValue = Component.getExpression(node.dataset.html || node.getAttribute('xhtml'));
		this.state$.subscribe(state => {
			this.innerHTML = getValue(state);
		});
	}

	static meta = {
		selector: `[data-html],[xhtml]`,
	};

}
