import { SignalWatcher } from '@lit-labs/preact-signals';
import { range } from '@roenlie/mimic-core/array';
import { storageHandler } from '@roenlie/mimic-core/dom';
import { MMButton } from '@roenlie/mimic-elements/button';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { Router } from '@vaadin/router';
import { css, html } from 'lit';
import { map } from 'lit/directives/map.js';

import type { Campaign } from '../campaign-tracker/campaign-tracker.js';

MMButton.register();


@SignalWatcher
@customElement('mh-campaign-selector-page')
export class CampaignSelectorPage extends MimicElement {

	public static page = true;

	protected availableCampaigns: Campaign[] = [];

	public override connectedCallback() {
		super.connectedCallback();

		this.availableCampaigns = storageHandler.getItem<Campaign[]>('availableCampaigns', []);
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();
	}

	protected handleClickNewCampaign() {
		Router.go('./campaign-create');
	}

	protected handle = {
		clickNewCampaign: this.handleClickNewCampaign.bind(this),
	};

	protected override render() {
		return html`
		<s-scroll-wrapper>
			<ul>
			${ map(range(100).map((num) => ({ campaignName: 'campaign: ' + num })), campaign => {
				return html`
				<li>
					${ campaign.campaignName }
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
		}
		li {
			display: grid;
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
		mm-button {
			position: sticky;
			place-self: center;
			bottom: 0px;
		}
		`,
	];

}
