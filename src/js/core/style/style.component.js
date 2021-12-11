import { Component } from '../../core/component/component';

export class StyleComponent extends Component {

	onInit() {
		const node = this.node;
		const getValue = Component.getExpression(node.dataset.style || node.getAttribute('xstyle'));
		this.state$.subscribe(state => {
			const style = getValue(state);
			const previousStyle = this.previousStyle;
			if (previousStyle) {
				for (let key in previousStyle) {
					if (!style || !style[key]) {
						const splitted = key.split('.');
						const propertyName = splitted.shift();
						node.style.removeProperty(propertyName);
					}
				}
			}
			if (style) {
				for (let key in style) {
					if (!previousStyle || previousStyle[key] !== style[key]) {
						const splitted = key.split('.');
						const propertyName = splitted.shift();
						const value = style[key] + (splitted.length ? splitted[0] : '');
						node.style.setProperty(propertyName, value);
					}
				}
			}
			this.previousStyle = style;
		});
	}

	static meta = {
		selector: `[data-style],[xstyle]`,
	};
}
