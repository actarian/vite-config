import { AttributeComponent } from './attribute/attribute.component';
import { ClassComponent } from './class/class.component';
import { EventComponent } from './event/event.component';
import { ForComponent } from './for/for.component';
import { HtmlComponent } from './html/html.component';
import { IfComponent } from './if/if.component';
import { StyleComponent } from './style/style.component';

export const CoreModule = {
	factories: [
		AttributeComponent,
		ClassComponent,
		EventComponent,
		ForComponent,
		HtmlComponent,
		IfComponent,
		StyleComponent,
	],
};
