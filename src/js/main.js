import '../css/main-cssvars.scss';
import { AppComponent } from './app.component';
import { CommonModule } from './common/common.module';
import { ComponentsModule } from './components/components.module';
import { Component } from './core/component/component';
import { CoreModule } from './core/core.module';
import { FormsModule } from './forms/forms.module';

function registerApp$(parent = document) {
	return Component.register$([
		...CoreModule,
		...CommonModule,
		...FormsModule,
		...ComponentsModule,
		AppComponent,
		['LazySectionComponent', './modules/lazy-section.component.js', '[lazy-section]'],
	], parent);
};

window.addEventListener('DOMContentLoaded', () => {
	registerApp$(document).subscribe(instances => {
		// console.log('registerComponents$', instances.length, instances[instances.length - 1]);
	});
});

window.registerApp$ = registerApp$;

function threeshake() {
	console.log('if this comment is present in the main.js there is a threeshake error!');
}
