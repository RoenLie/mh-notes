import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { css, html } from 'lit';


@customElement('m-navbar')
export class NavbarCmp extends MimicElement {

	protected override render(): unknown {
		return html`

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
		}
		`,
	];

}
