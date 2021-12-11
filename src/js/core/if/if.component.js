
import { Component } from '../../core/component/component';

export class IfComponent extends Component {

	get flag() {
		return this.flag_;
	}
	set flag(flag) {
		if (this.flag_ !== flag) {
			this.flag_ = flag;
			if (flag) {
				const clonedNode = this.template.cloneNode(true);
				this.clonedNode = clonedNode;
				this.ref.after(clonedNode);
				window.registerApp$(clonedNode).subscribe(
					// instances => { }
				);
			} else {
				if (this.clonedNode) {
					this.clonedNode.remove();
					this.clonedNode = null;
				}
				Component.unregister(this.template);
			}
		}
	}

	onInit() {
		const node = this.node;
		this.originalNode = node.cloneNode(true);
		const ref = this.ref = this.node = document.createComment('if');
		node.parentNode.replaceChild(ref, node);
		const template = this.template = node.cloneNode(true);
		template.removeAttribute('xif');
		template.removeAttribute('data-if');
		const getValue = Component.getExpression(node.dataset.if || node.getAttribute('xif'));
		this.state$.subscribe(state => {
			this.flag = getValue(state);
		});
	}

	static meta = {
		selector: '[data-if],[xif]',
	};

}
