import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { type Context, type Route, Router } from '@vaadin/router';
import { css } from 'lit';


@customElement('m-app-router')
export class AppRouterCmp extends MimicElement {

	protected router = new Router();
	protected routes: Route[] = [
		{
			name:   'root',
			path:   '/',
			action: this.routeComponent(
				() => import('../layout/layout.cmp.js'),
			),
			children: [
				{
					path:   '/login',
					action: () => {
						location.replace(window.location.href + '.html');
					},
				},
				{ path: '/', redirect: '/campaign-list' },
				{
					path:   '/campaign-list',
					action: this.routeComponent(
						() => import('../../pages/campaign-selector/campaign-selector-page.cmp.js'),
					),
				},
				{
					path:   '/campaign-tracker',
					action: this.routeComponent(
						() => import('../../pages/campaign-tracker/campaign-tracker-page.cmp.js'),
					),
				},
			],
		},
	];

	public override connectedCallback(): void {
		super.connectedCallback();

		this.router.setOutlet(this.shadowRoot);
		this.router.setRoutes(this.routes);
	}

	/** Loops through the exports from a dynamic import and check for a component that is both a MimicElement
	 * and marked with the public static property of `page` set to `true`.
	 * Uses this exported component as the component for the given route.
	 */
	protected routeComponent<T extends() => Promise<Record<string, any>>>(importFn: T) {
		return async (context: Context) => {
			const module = await importFn();

			for (const exprt of Object.values(module)) {
				if ('page' in exprt && exprt.page === true && MimicElement.isPrototypeOf(exprt)) {
					const _exprt = exprt as typeof MimicElement;

					context.route.component = _exprt.tagName;
					_exprt.register();
				}
			}
		};
	}

	public static override styles = [
		css`
		:host {
			display: contents;
		}
		`,
	];

}
