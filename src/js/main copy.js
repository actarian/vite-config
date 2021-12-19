import '../css/main-cssvars.scss';
import { AppComponent } from './app.component';
import { CommonModule } from './common/common.module';
import { ComponentsModule } from './components/components.module';
import { Pow } from './components/pow/pow';
import { Component } from './core/component/component';
import { CoreModule } from './core/core.module';
import { useModule } from './core/module/module';
import { FormsModule } from './forms/forms.module';

const module = [
	...CoreModule,
	...CommonModule,
	...FormsModule,
	...ComponentsModule,
	AppComponent,
	['LazySectionComponent', './modules/lazy-section.component.js', '[lazy-section]'],
];

function registerApp$(parent = document) {
	return Component.register$(module, parent);
};

function registerApp(parent = document) {
	return Component.register(module, parent);
};

window.addEventListener('DOMContentLoaded', () => {
	registerApp$(document).subscribe(instances => {
		// console.log('registerComponents$', instances.length, instances[instances.length - 1]);
	});
});

window.registerApp$ = registerApp$;
window.registerApp = registerApp;

function threeshake() {
	console.log('if this comment is present in the main.js there is a threeshake error!');
}

const div = document.createElement('div');
document.body.appendChild(div);
div.innerHTML = /* html */`
	<div data-app>
		<div data-html="items.length | pow"></div>
	</div>
`;
const app = useModule({
	factories: [
		...CoreModule,
		AppComponent,
	],
	pipes: [Pow],
});
app.register(div);

/*

const app = useModule({
	imports: [
		CoreModule
	],
	declarations: [
		TodoItemComponent,
		DatePipe,
	],
	bootstrap: AppComponent,
})

AppModule.meta = {
	imports: [
		CoreModule
	],
	declarations: [
		TodoItemComponent,
		DatePipe,
	],
	bootstrap: AppComponent,
};
*/
