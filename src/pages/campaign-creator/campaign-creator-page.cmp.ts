import { MMInput } from '@roenlie/mimic-elements/input';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { html } from 'lit';

MMInput.register();


@customElement('mh-campaign-creator-page')
export class CampaignCreatorPage extends MimicElement {

	public static page = true;


	protected override render(): unknown {
		return html`
		<mm-input
			label="Campaign name"
		></mm-input>

		`;
	}

}
