import { Component } from '../component/component';

export class HtmlComponent extends Component {

	set innerHTML(innerHTML) {
		if (this.innerHTML_ !== innerHTML) {
			this.innerHTML_ = innerHTML;
			const  node = this.node;
			node.innerHTML = innerHTML == undefined ? '' : innerHTML; // !!! keep == loose equality
		}
	}
	get innerHTML() {
		return this.innerHTML_;
	}

	onInit() {
		const getValue = Component.getExpression(this.node.getAttribute('xhtml') || this.node.getAttribute('data-html'));
		this.state$.subscribe(state => {
			this.innerHTML = getValue(state);
		});
	}

	static meta = {
		selector: `[xhtml],[data-html]`,
	};

}
