import { SignalWatcher } from '@lit-labs/preact-signals';
import { camelCaseToWords } from '@roenlie/mimic-core/string';
import { type Change, readPath } from '@roenlie/mimic-core/structs';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import type { CampaignTracker, Item, Monster } from '../campaign-tracker.js';
import { getObjectDiff } from '../object-diff.js';


@SignalWatcher
@customElement('mh-campaign-hunters-log')
export class CampaignHuntersLog extends MimicElement {

	@property({ type: Object }) public campaignTracker: CampaignTracker;

	protected createKeyFromChange(change: Change) {
		let label = change.path.split('.').slice(1).join(' ');

		// only monsterparts are nested, so we check for a length of 2 to confirm.
		if (change.path.split('.value.').length === 2) {
			const parts = change.path.split('.value.');

			const monster = readPath(
				this.campaignTracker.currentCampaignDay as any,
				parts[0]!,
			) as Monster;

			const item = readPath(
				this.campaignTracker.currentCampaignDay as any,
				change.path.split('.').slice(0, -1).join('.'),
			) as Item;

			label = monster.key + ' ' + item.key;
		}
		else if (change.path.endsWith('value')) {
			const item = readPath(
				this.campaignTracker.currentCampaignDay as any,
				change.path.split('.').slice(0, -1).join('.'),
			) as Item;

			label = item.key;
		}
		else if (!change.path.includes('.')) {
			label = change.path;
		}

		return camelCaseToWords(label);
	}

	protected renderChanges(label: string, changes: Change[]) {
		if (!changes.length)
			return nothing;

		return html`
		<s-changes>
			<span>
				${ label }:
			</span>
			${ map(changes, change => html`
			<s-change>
				<s-text>
					${ this.createKeyFromChange(change) }
				</s-text>
				<s-text>
					from ${ change.oldValue ?? 0 }
				</s-text>
				<s-text>
					=> ${ change.newValue }
				</s-text>
			</s-change>
			`) }
		</s-changes>
		`;
	}

	protected override render() {
		const campaign = this.campaignTracker;
		const days = structuredClone(campaign.days.slice(0, campaign.day.value));

		const diffs = days.map((current, index) => index === 0 ? [] : getObjectDiff(days[index - 1]!, current))
			.map(arr => arr
				// Not interested in changes to id or which day it is.
				.filter(change => change?.path !== 'day' && change?.path !== 'campaignId')
				// Anything ending in key is a name change.
				.filter(change => !change.path.endsWith('key'))
				// paths that are not interesting for diff purposes.
				.filter(change => ![ 'notes' ].includes(change.path)));

		return html`
		<h2>
			Hunters Log
		</h2>

		<s-log>
			${ map(diffs.toReversed(), (changes, i) => {
				const gained: Change[] = [];
				const lost: Change[] = [];

				const dayIndex = (diffs.length - i);

				for (const change of changes) {
					if (!change.oldValue)
						gained.push(change);
					else if (!change.newValue)
						lost.push(change);
					else if (change.oldValue < change.newValue)
						gained.push(change);
					else if (change.oldValue > change.newValue)
						lost.push(change);
				}

				return html`
				<s-day-overview>
					<s-day>
						Day ${ dayIndex }
					</s-day>

					${ this.renderChanges('Gained', gained) }
					${ this.renderChanges('Lost', lost) }

					${ when(days[dayIndex - 1]?.notes, () => html`
					<s-note>
						<label>Note</label>
						<div>
							${ days[dayIndex - 1]!.notes }
						</div>
					</s-note>
					`) }
				</s-day-overview>
				`;
			}) }
		</s-log>
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
			padding-block: 12px;
			justify-self: center;
		}
		s-log {
			display: grid;
			grid-auto-rows: max-content;
			grid-template-columns: 1fr max-content max-content;
			grid-template-rows: max-content max-content;
			column-gap: 4px;
		}
		s-day-overview {
			position: relative;
			display: grid;
			grid: subgrid / subgrid;
			border: 2px solid var(--md-surface-container-highest);
			padding: 8px;
			border-radius: 12px;
			grid-column: span 3;
			grid-row: span 3;
			padding-inline: 24px;
			font-size: 12px;
		}
		s-day-overview:not(:first-of-type) {
			margin-top: 24px;
		}
		s-day {
			font-weight: bold;
			grid-column: span 3;
			font-weight: bold;
			position: absolute;
			top: -8px;
			left: 24px;
			line-height: 1em;
		}
		s-changes {
			overflow: hidden;
			display: grid;
			grid-template-columns: subgrid;
			grid-column: span 3;
		}
		s-changes > span {
			grid-column: span 3;
			font-style: italic;
			opacity: 0.8;
			border-bottom: 1px solid var(--md-surface-container-highest);
		}
		s-changes {
			padding-top: 8px;
		}
		s-change {
			display: grid;
			grid-column: span 3;
			grid-auto-rows: max-content;
			grid-template-columns: subgrid;
		}
		s-change > *:nth-child(2) {
			justify-self: end;
		}
		s-change > *:nth-child(3) {
			justify-self: start;
		}
		s-note {
			grid-column: span 3;
			display: grid;
			padding-top: 8px;
		}
		s-note label {
			grid-column: span 3;
			font-style: italic;
			opacity: 0.8;
			border-bottom: 1px solid var(--md-surface-container-highest);
		}
		`,
	];

}
