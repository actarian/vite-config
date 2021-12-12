import './lazy-section.component.scss';

export function LazySectionComponent(node, unsubscribe$) {
	const time = Math.floor(performance.now() / 100) / 10;
	console.log('LazySectionComponent.onInit', time);
	node.querySelector('.section__time').innerHTML = `LazySectionComponent.onInit at ${time}s`;
	// node.querySelector('.section__time').innerHTML = RelativeDateService.getRelativeTime();
}
