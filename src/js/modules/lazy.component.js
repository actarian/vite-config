import './lazy.component.scss';

export function LazyComponent(node, data, unsubscribe$) {
	const time = Math.floor(performance.now() / 100) / 10;
	console.log('LazyComponent.onInit', time);
	node.querySelector('.section__time').innerHTML = `LazyComponent.onInit at ${time}s`;
	// node.querySelector('.section__time').innerHTML = RelativeDateService.getRelativeTime();
}
