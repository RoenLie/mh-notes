import { SignalWatcher } from '@lit-labs/preact-signals';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';


@SignalWatcher
@customElement('mh-campaign-selector-page')
export class CampaignSelectorPage extends MimicElement {

	public static page = true;

	public override connectedCallback() {
		super.connectedCallback();
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();
	}

	protected override render() {
		return html`
		<div>
			hei
		</div>
		`;
	}

	public static override styles = [
		sharedStyles,
		css`
		:host {
			/*align-self:center;*/
		}
		div {
			/*height: 300vh;*/
			/*background-color: blue;*/
			/*width: 200px;*/
		}
		`,
	];

}
