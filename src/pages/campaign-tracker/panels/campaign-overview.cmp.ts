import { SignalWatcher } from '@lit-labs/preact-signals';
import type { EventOf } from '@roenlie/mimic-core/dom';
import { camelCaseToWords } from '@roenlie/mimic-core/string';
import { MMButton } from '@roenlie/mimic-elements/button';
import { MMInput } from '@roenlie/mimic-elements/input';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import type { CampaignTracker } from '../campaign-tracker.js';

MMInput.register();
MMButton.register();


@SignalWatcher
@customElement('mh-campaign-overview')
export class CampaignOverview extends MimicElement {

	@property({ type: Object }) public campaignTracker: CampaignTracker;

	protected formFields = [
		'playerName',
		'campaignName',
		'hunterName',
		'palicoName',
		'campaignLength',
	] as (keyof CampaignTracker)[];

	protected override render() {
		return html`
		<h2>
			Campaign
		</h2>

		${ map(this.formFields, (key) => html`
		<mm-input
			label=${ camelCaseToWords(key) }
			.value=${ this.campaignTracker[key] as any }
			@change=${ (ev: EventOf<MMInput>) => {
				(this.campaignTracker as any)[key] = ev.target.value || '';
				this.requestUpdate();
			} }
		></mm-input>
		`) }

		<s-action-wrapper>
			<mm-button @click=${ () => {
				this.campaignTracker.saveCampaign(this.campaignTracker.day.value);
				this.requestUpdate();
			} }>
				Save
			</mm-button>

			<mm-button variant="error" @click=${ () => {
				const remove = confirm('Delete campaign?');
				if (!remove)
					return;

				this.campaignTracker.deleteCampaign();
				const url = new URL(location.href);
				url.pathname = '/campaign-list';
				url.search = '';
				history.pushState('', '', url);
				globalThis.dispatchEvent(new PopStateEvent('popstate'));
			} }>
				Delete
			</mm-button>
		</s-action-wrapper>
		<h5>
			Last Saved: ${ new Date(this.campaignTracker.lastUpdated).toUTCString() }
		</h5>
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
			gap: 12px;

			--scrollbar-thumb-bg: var(--md-surface-container-highest);
			--scrollbar-width: 2px;
		}
		h2 {
			justify-self: center;
			padding-block: 12px;
		}
		h5 {
			justify-self: center;
		}
		mm-button {
			justify-self: center;
			padding-block: 12px;
		}
		s-action-wrapper {
			display: grid;
			grid-auto-flow: column;
		}
		`,
	];

}
