import { copyTextToClipboard, type EventOf, storageHandler } from '@roenlie/mimic-core/dom';
import { alertPortal, Alerts } from '@roenlie/mimic-elements/alert';
import { MMButton } from '@roenlie/mimic-elements/button';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';
import { state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { when } from 'lit/directives/when.js';

import { SearchParams } from '../../features/router/navigate.js';
import type { Campaign } from '../campaign-tracker/campaign-tracker.js';

MMButton.register();


@customElement('mh-settings-page')
export class SettingsPage extends MimicElement {

	public static page = true;

	@state() protected importData = '';
	@state() protected exportData = '';

	protected async handleCopyExportedData() {
		const textarea = this.shadowRoot
			?.querySelector<HTMLTextAreaElement>('s-export-campaign textarea');

		try {
			await copyTextToClipboard(textarea?.value ?? '');
			Alerts.define({ variant: 'success', duration: 2000 })
				.template(() => 'Copied to clipboard.')
				.displayTo(alertPortal);
		}
		catch (error) {
			Alerts.define({ variant: 'error', duration: 2000 })
				.template(() => 'Failed to copy to clipboard.')
				.displayTo(alertPortal);
		}
	}

	protected handleImportCampaign() {
		let importData: Campaign | Campaign[];
		let availableCampaigns: Campaign[] = [];

		const errAlert = Alerts.define({ variant: 'error', duration: 2000 })
			.template(() => 'Invalid Campaign import string.');

		try {
			importData = JSON.parse(this.importData) as Campaign | Campaign[];
		}
		catch (err) {
			return errAlert.displayTo(alertPortal);
		}

		if (Array.isArray(importData)) {
			availableCampaigns = importData;
		}
		else if (typeof importData === 'object') {
			availableCampaigns = storageHandler.getItem<Campaign[]>('availableCampaigns', []);
			const existingIndex = availableCampaigns
				.findIndex(c => c.campaignId === (importData as Campaign).campaignId);

			if (existingIndex > -1)
				availableCampaigns[existingIndex] = importData;
			else
				availableCampaigns.push(importData);
		}
		else {
			return errAlert.displayTo(alertPortal);
		}

		storageHandler.setItem('availableCampaigns', availableCampaigns);

		Alerts.define({ variant: 'success', duration: 2000 })
			.template(() => 'Campaign data imported.')
			.displayTo(alertPortal);
	}

	protected exportAllCampaigns() {
		const availableCampaigns = storageHandler.getItem<Campaign[]>('availableCampaigns', []);

		this.exportData = JSON.stringify(availableCampaigns, null, 3);
	}

	protected exportCurrentCampaign() {
		const availableCampaigns = storageHandler.getItem<Campaign[]>('availableCampaigns', []);
		const campaignId = SearchParams.get('campaign-id');

		const campaign = availableCampaigns.find(c => c.campaignId === campaignId);
		if (campaign)
			this.exportData = JSON.stringify(campaign, null, 3);
	}

	protected override render(): unknown {
		return html`
		<s-import-campaign>
			<mm-button
				@click=${ this.handleImportCampaign }
			>
				Import Campaign Data
			</mm-button>
			<textarea
				spellcheck =false
				placeholder="Paste valid campaign data here."
				.value     =${ live(this.importData) }
				@change    =${ (ev: EventOf<HTMLTextAreaElement>) => this.importData = ev.target.value }
			></textarea>
		</s-import-campaign>

		<s-export-campaign>
			<mm-button
				@click=${ this.exportAllCampaigns }
			>
				Export All Data
			</mm-button>
			${ when(SearchParams.has('campaign-id'), () => html`
			<mm-button
				@click=${ this.exportCurrentCampaign }
			>
				Export Selected Campaign
			</mm-button>
			`) }
			<textarea
				readonly
				spellcheck =false
				placeholder="Text here will be a valid campaign data string."
				.value     =${ live(this.exportData) }
				@change    =${ (ev: EventOf<HTMLTextAreaElement>) => this.exportData = ev.target.value }
			></textarea>
			<mm-button
				size="x-small"
				shape="sharp"
				class="copy-button"
				@click=${ this.handleCopyExportedData }
			>
				Copy
			</mm-button>
		</s-export-campaign>
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
			overflow: scroll;
			gap: 24px;

			--scrollbar-thumb-bg: var(--md-surface-container-highest);
			--scrollbar-width: 2px;
			--scrollbar-height: 2px;
		}
		s-import-campaign,
		s-export-campaign {
			position: relative;
			display: grid;
			place-items: center;
			gap: 16px;
			border: 2px solid var(--md-surface-container-highest);
			border-radius: 12px;
			padding-block: 24px;
			padding-inline: 24px;
		}
		textarea {
			all: unset;
			background-color: var(--md-surface-container);
			border: 2px solid var(--md-surface-container-highest);
			height: 200px;
			width: 100%;
		}
		.copy-button {
			position: absolute;
			right: 32px;
			bottom: 16px;
		}
		`,
	];

}
