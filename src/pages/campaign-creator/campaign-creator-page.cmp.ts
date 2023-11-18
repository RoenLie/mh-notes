import { domId, type EventOf } from '@roenlie/mimic-core/dom';
import { camelCaseToWords } from '@roenlie/mimic-core/string';
import { MMButton } from '@roenlie/mimic-elements/button';
import { MMInput } from '@roenlie/mimic-elements/input';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';

import { CampaignTracker } from '../campaign-tracker/campaign-tracker.js';

MMInput.register();
MMButton.register();


@customElement('mh-campaign-creator-page')
export class CampaignCreatorPage extends MimicElement {

	public static page = true;

	protected abort = new AbortController();
	protected campaign = new CampaignTracker(domId());

	public override connectedCallback() {
		super.connectedCallback();
		this.addEventListener('change', () => this.requestUpdate(),
			{ signal: this.abort.signal });
	}

	protected handleCreateCampaign() {
		this.campaign.saveCampaign();

		const url = new URL(location.href);
		url.pathname = '/campaign-tracker';
		url.searchParams.set('campaign-id', this.campaign.campaignId);
		history.pushState('', '', url);
		window.dispatchEvent(new PopStateEvent('popstate'));
	}

	protected formFields = [
		'playerName',
		'campaignName',
		'hunterName',
		'palicoName',
		'campaignLength',
	] as (keyof CampaignTracker)[];

	protected handle = {
		createCampaign: this.handleCreateCampaign.bind(this),
	};

	protected override render(): unknown {
		return html`
		${ map(this.formFields, (key) => html`
		<mm-input
			label=${ camelCaseToWords(key) }
			.value=${ this.campaign[key] as any }
			@change=${ (ev: EventOf<MMInput>) => (this.campaign as any)[key] = ev.target.value }
		></mm-input>
		`) }

		<mm-button
			?disabled=${ !this.campaign.isValidCampaign() }
			@click=${ this.handle.createCampaign }
		>
			Submit
		</mm-button>
		`;
	}

	public static override styles = [
		sharedStyles,
		css`
		:host {
			display: grid;
			grid-auto-rows: max-content;
			padding-block: 32px;
			padding-inline: 22px;
			gap: 12px;
		}
		mm-button {
			place-self: center;
		}
		`,
	];

}
