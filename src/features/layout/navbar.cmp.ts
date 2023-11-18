import { MMButton } from '@roenlie/mimic-elements/button';
import { MMIcon } from '@roenlie/mimic-elements/icon';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { css, html } from 'lit';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import { baseUrl, navigate, SearchParams } from '../router/navigate.js';

MMButton.register();
MMIcon.register();


@customElement('m-navbar')
export class NavbarCmp extends MimicElement {

	protected abort =  new AbortController();

	protected nav: { pathname: string; iconUrl: string; visible: () => boolean; }[] = [
		{
			pathname: '/campaign-list',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/list-ul.svg',
			visible:  () => true,
		},
		{
			pathname: '/campaign-tracker',
			iconUrl:  'https://icons.getbootstrap.com/assets/icons/vignette.svg',
			visible:  () => SearchParams.has('campaign-id'),
		},
	];

	public override connectedCallback() {
		super.connectedCallback();
		globalThis.addEventListener('popstate', this.handlePopstate.bind(this),
			{ signal: this.abort.signal });
	}

	public override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.abort.abort();
	}

	protected handlePopstate(_ev: PopStateEvent) {
		this.requestUpdate();
	}

	protected override render(): unknown {
		return html`
		${ map(this.nav, nav => when(nav.visible(), () => html`
		<mm-button
			type="icon"
			variant=${ baseUrl + nav.pathname === location.pathname
				? 'primary' : 'outline' }
			shape="rounded"
			size="large"
			@click=${ () => {
				navigate({
					pathname: nav.pathname,
				});
			} }
		>
			<mm-icon
				style="font-size:28px;"
				url=${ nav.iconUrl }
			></mm-icon>
		</mm-button>
		`)) }
		`;
	}

	public static override styles = [
		css`
		:host {
			display: grid;
			height: 80px;
			color: var(--md-on-surface);
			background-color: var(--md-surface);
			border-top: 2px solid var(--md-surface-container-highest);

			grid-auto-flow: column;
			grid-auto-columns: max-content;
			place-content: center;
			padding-inline: 24px;
			gap: 24px;
		}
		`,
	];

}
