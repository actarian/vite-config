
import { Component } from '../component/component';

export class IfComponent extends Component {

	flag_ = true;
	get flag() {
		return this.flag_;
	}
	set flag(flag) {
		// console.log('flag', flag);
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
		this.template = node.cloneNode(true);
		this.template.removeAttribute('xif');
		this.template.removeAttribute('data-if');
		const ref = this.ref = document.createComment('if');
		node.before(ref);
		node.remove();
		this.node = ref;
		this.originalNode = node;
		const getValue = Component.getExpression(node.getAttribute('xif') || node.getAttribute('data-if'));
		this.state$.subscribe(state => {
			this.flag = getValue(state);
		});
	}

	static meta = {
		selector: '[xif],[data-if]',
	};

}
