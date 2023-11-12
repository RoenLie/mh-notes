import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';


@customElement('mh-campaign-inventory')
export class CampaignInventory extends MimicElement {

	protected override render() {
		return html`
		Here goes the inventory

		<div style="height:300vh;"></div>
		`;
	}

	public static override styles = [
		sharedStyles,
		css`
		:host {
			display: block;
			overflow-x: hidden;
			overflow-y: scroll;
		}
		`,
	];

}
