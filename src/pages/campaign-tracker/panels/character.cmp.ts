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
@customElement('mh-campaign-character')
export class CampaignCharacter extends MimicElement {

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
			Character
		</h2>

		${ map(this.formFields, (key) => html`
		<mm-input
			label=${ camelCaseToWords(key) }
			.value=${ this.campaignTracker[key] as any }
			@change=${ (ev: EventOf<MMInput>) => (this.campaignTracker as any)[key] = ev.target.value }
		></mm-input>
		`) }

		<mm-button
			@click=${ () => this.campaignTracker.saveCampaign() }
		>
			Save
		</mm-button>
		`;
	}

	public static override styles = [
		sharedStyles,
		css`
		:host {
			--scrollbar-thumb-bg: var(--md-surface-container-highest);
			--scrollbar-width: 2px;

			display: grid;
			grid-auto-rows: max-content;
			padding-inline: 22px;
			gap: 12px;
			overflow-x: hidden;
			overflow-y: scroll;
		}
		h2 {
			justify-self: center;
			padding-block: 12px;
		}
		mm-button {
			justify-self: center;
			padding-block: 12px;
		}
		`,
	];

}
