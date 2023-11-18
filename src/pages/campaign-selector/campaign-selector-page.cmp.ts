import { SignalWatcher } from '@lit-labs/preact-signals';
import { storageHandler } from '@roenlie/mimic-core/dom';
import { MMButton } from '@roenlie/mimic-elements/button';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';
import { map } from 'lit/directives/map.js';

import { navigate } from '../../features/router/navigate.js';
import type { Campaign } from '../campaign-tracker/campaign-tracker.js';

MMButton.register();


@SignalWatcher
@customElement('mh-campaign-selector-page')
export class CampaignSelectorPage extends MimicElement {

	public static page = true;

	protected availableCampaigns: Campaign[] = [];

	public override connectedCallback() {
		super.connectedCallback();

		this.availableCampaigns = storageHandler
			.getItem<Campaign[]>('availableCampaigns', []);
	}

	protected handleClickNewCampaign() {
		navigate({
			pathname: '/campaign-create',
			search:   '',
		});
	}

	protected handleClickExistingCampaign(ev: Event) {
		type CampaignElement = HTMLElement & { campaign: Campaign; };
		const target = ev.composedPath()
			.find(el => 'campaign' in el) as CampaignElement | undefined;

		if (!target)
			return;

		navigate({
			pathname: '/campaign-tracker',
			search:   {
				'campaign-id': target.campaign.campaignId,
			},
		});
	}

	protected handle = {
		clickNewCampaign:      this.handleClickNewCampaign.bind(this),
		clickExistingCampaign: this.handleClickExistingCampaign.bind(this),
	};

	protected override render() {
		return html`
		<s-scroll-wrapper>
			<ul @click=${ this.handle.clickExistingCampaign }>
			${ map(this.availableCampaigns, campaign => {
				return html`
				<li .campaign=${ campaign }>
					<span>
						Campaign:
					</span>
					<span>
						${ campaign.campaignName }
					</span>
				</li>
				`;
			}) }
			</ul>

			<mm-button
				@click=${ this.handle.clickNewCampaign }
			>
				New Campaign
			</mm-button>
		</s-scroll-wrapper>
		`;
	}

	public static override styles = [
		sharedStyles,
		css`
		:host {
			overflow: hidden;
			display: grid;
		}
		s-scroll-wrapper {
			overflow-x: hidden;
			overflow-y: scroll;
			display: grid;
			grid-template-rows: 1fr max-content;
			padding-bottom: 40px;
		}
		s-scroll-wrapper::-webkit-scrollbar {
			display: none;
		}
		ul,li {
			all: unset;
			display: grid;
		}
		ul {
			padding-bottom: 40px;
			grid-auto-rows: max-content;
			grid-template-columns: 1fr 1fr
		}
		li {
			display: grid;
			grid-template-columns: subgrid;
			grid-column: 1/3;
			gap: 12px;
			place-items: center;
			height: 60px;
			color: var(--md-surface-container-text);
			background-color: var(--md-surface-container);
			border: 2px solid var(--md-surface-container-highest);
			border-left: none;
			border-right: none;
			margin-block: -2px;
		}
		li:first-of-type {
			margin-top: 0px;
		}
		li:hover {
			background-color: var(--md-surface-container-high);
		}
		li > *:first-of-type {
			justify-self: end;
		}
		li > *:last-of-type {
			justify-self: start;
		}
		mm-button {
			position: sticky;
			place-self: center;
			bottom: 0px;
		}
		`,
	];

}
