import './lazy-module.component.scss';

export function LazyModuleComponent(node, data, unsubscribe$) {
	const time = Math.floor(performance.now() / 100) / 10;
	console.log('LazyModuleComponent.onInit', time);
	node.querySelector('.section__time').innerHTML = `LazyModuleComponent.onInit at ${time}s`;
	// node.querySelector('.section__time').innerHTML = RelativeDateService.getRelativeTime();
}

LazyModuleComponent.meta = {
	selector: `[data-lazy-module-component]`,
};
