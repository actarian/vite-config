import '../css/main-cssvars.scss';
import { AppComponent } from './app.component';
import { CommonModule } from './common/common.module';
import { ComponentsModule } from './components/components.module';
import { Pow } from './components/pow/pow';
import { CoreModule } from './core/core.module';
import { useModule } from './core/module/module';
import { FormsModule } from './forms/forms.module';

const app = useModule({
	imports: [
		CoreModule,
		CommonModule,
		FormsModule,
		ComponentsModule,
	],
	factories: [
		AppComponent,
		['LazySectionComponent', './modules/lazy-section.component.js', '[lazy-section]'],
	],
	pipes: [
		Pow,
	],
});

window.addEventListener('DOMContentLoaded', () => {
	app.observe$(document).subscribe(_ => {
		// console.log('registerComponents$', _.length, _[_.length - 1]);
	});
});

function threeshake() {
	console.log('if this comment is present in the main.js there is a threeshake error!');
}
