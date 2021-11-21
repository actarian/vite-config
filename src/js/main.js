import '../css/main-cssvars.scss';
import { AppComponent } from './app.component';
import { Component } from './common/component/component';
import { SectionComponent } from './components/section.component';

function registerApp$(parent = document) {
	return Component.register$([
		AppComponent,
    SectionComponent,
    ['LazySectionComponent', './modules/lazy-section.component.js', '[lazy-section]'],
	], parent);
};

window.addEventListener('DOMContentLoaded', () => {
	registerApp$(document).subscribe(instances => {
		console.log('registerComponents$', instances.length, instances[instances.length - 1]);
	});
});

window.registerApp$ = registerApp$;

function threeshake() {
  console.log('if this comment is present in the main.js there is a threeshake error!');
}
