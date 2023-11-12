import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';


@customElement('mh-campaign-day-selector')
export class CampaignDaySelector extends MimicElement {

	protected override render() {
		return html`
		Here goes the day selector

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
