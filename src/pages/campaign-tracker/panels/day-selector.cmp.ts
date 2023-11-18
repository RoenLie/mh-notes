import { SignalWatcher } from '@lit-labs/preact-signals';
import { MMText } from '@roenlie/mimic-elements/text';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import type { CampaignDay, CampaignTracker } from '../campaign-tracker.js';

MMText.register();


@SignalWatcher
@customElement('mh-campaign-day-selector')
export class CampaignDaySelector extends MimicElement {

	@property({ type: Object }) public campaignTracker: CampaignTracker;

	protected handleClickCampaignDay(ev: Event) {
		const target = ev.composedPath().find(el => 'campaignDay' in el) as HTMLElement & {
			campaignDay: CampaignDay
		} | undefined;

		if (!target)
			return;

		this.campaignTracker.day.value = target.campaignDay.day;
	}


	protected override render() {
		const campaign = this.campaignTracker;

		return html`
		<h2>
			Day selector
		</h2>

		<ul @click=${ this.handleClickCampaignDay }>
		${ map(this.campaignTracker.days, day => html`
			<li class=${ classMap({ active: campaign.day.value === day.day }) }
				.campaignDay=${ day }
			>
				${ day.day }
			</li>
		`) }
		</ul>

		${ when(campaign.days.length < campaign.campaignLength, () => html`
		<mm-button @click=${ () => {
			campaign.newDay();
			this.requestUpdate();
		} }>
			<mm-icon
				url="https://icons.getbootstrap.com/assets/icons/plus-lg.svg"
			></mm-icon>
		</mm-button>
		`) }
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
		ul, li {
			all: unset;
			display: grid;
		}
		ul {
			--_item-size: 80px;
			grid-template-columns: repeat(auto-fit, var(--_item-size));
			padding: 12px;
			font-size: 32px;
			justify-content: center;
		}
		li {
			height: var(--_item-size);
			place-items: center;
			border: 2px solid var(--md-surface-container-highest);
			margin-inline: -1px;
			margin-block: -1px;
		}
		li.active {
			outline: 2px solid var(--mm-primary);
			outline-offset: -2px;
			z-index: 1;
		}
		mm-button {
			position: sticky;
			justify-self: center;
			bottom: -30vh;
			z-index: 2;
			padding-top: 24px;
		}
		`,
	];

}
