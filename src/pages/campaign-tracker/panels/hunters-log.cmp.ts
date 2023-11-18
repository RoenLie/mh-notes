import { SignalWatcher } from '@lit-labs/preact-signals';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';

import type { CampaignTracker } from '../campaign-tracker.js';


@SignalWatcher
@customElement('mh-campaign-hunters-log')
export class CampaignHuntersLog extends MimicElement {

	@property({ type: Object }) public campaignTracker: CampaignTracker;

	protected override render() {
		return html`
		<h2>
			Hunters Log
		</h2>

		<div style="height:300vh;"></div>
		`;
	}

	public static override styles = [
		sharedStyles,
		css`
		:host {
			display: grid;
			grid-auto-rows: max-content;
			overflow-x: hidden;
			overflow-y: scroll;

			padding-block: 32px;
			padding-inline: 22px;

			--scrollbar-thumb-bg: var(--md-surface-container-highest);
			--scrollbar-width: 2px;
		}
		h2 {
			padding-block: 12px;
			justify-self: center;
		}
		`,
	];

}
