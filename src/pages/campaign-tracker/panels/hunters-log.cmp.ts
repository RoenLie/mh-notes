import { SignalWatcher } from '@lit-labs/preact-signals';
import { camelCaseToWords } from '@roenlie/mimic-core/string';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';

import type { CampaignTracker } from '../campaign-tracker.js';


@SignalWatcher
@customElement('mh-campaign-hunters-log')
export class CampaignHuntersLog extends MimicElement {

	protected static createKeyFromChange(change: Change) {
		return camelCaseToWords(change.path.split('.').slice(1).join(' '));
	}

	@property({ type: Object }) public campaignTracker: CampaignTracker;

	protected renderChanges(label: string, changes: Change[]) {
		return html`
		<s-changes>
			<span>
				${ label }:
			</span>
			${ map(changes, change => html`
			<s-change>
				<s-text>
					${ CampaignHuntersLog.createKeyFromChange(change) }
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

		const diffs = days.map((current, index) => index === 0 ? [] : getChangedKeys(days[index - 1]!, current))
			.map(arr => arr.filter(change => change && change.path !== 'day' && change.path !== 'campaignId'));

		return html`
		<h2>
			Hunters Log
		</h2>

		<s-log>
			${ map(diffs, (changes, i) => {
				const gained: Change[] = [];
				const lost: Change[] = [];

				for (const change of changes) {
					if (!change.oldValue)
						gained.push(change);
					else if (!change.newValue)
						lost.push(change);
				}

				return html`
				<s-day-overview>
					<s-day>
						Day ${ i + 1 }
					</s-day>

					${ this.renderChanges('Gained', gained) }
					${ this.renderChanges('Lost', lost) }
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
		`,
	];

}


interface Change { path: string; oldValue?: any; newValue?: any; }

const traces = new WeakSet();

const getChangedKeys = (obj1: Record<keyof any, any>, obj2?: Record<keyof any, any>, parentKey = ''): Change[] => {
	const changedKeys: Change[] = [];

	if (traces.has(obj1) || (obj2 && traces.has(obj2))) {
		return changedKeys;
	}
	else {
		traces.add(obj1);
		obj2 && traces.add(obj2);
	}

	// Check keys in obj1
	for (const key in obj1) {
		const currentKey = parentKey ? `${ parentKey }.${ key }` : key;

		if (typeof obj1[key] === 'object' && typeof obj2?.[key] === 'object') {
			const nestedChanges = getChangedKeys(obj1[key], obj2[key], currentKey);
			changedKeys.push(...nestedChanges);
		}
		else if (obj1[key] !== obj2?.[key]) {
			if (typeof obj1[key] === 'object') {
				const nestedChanges = getChangedKeys(obj1[key], {}, currentKey);
				changedKeys.push(...nestedChanges);
			}
			else if (typeof obj2?.[key] === 'object') {
				const nestedChanges = getChangedKeys(obj2[key], {}, currentKey);
				changedKeys.push(...nestedChanges);
			}
			else {
				changedKeys.push({ path: currentKey, oldValue: obj1[key], newValue: obj2?.[key] });
			}
		}
	}

	// Check keys in obj2 that are not in obj1
	for (const key in obj2) {
		const currentKey = parentKey ? `${ parentKey }.${ key }` : key;

		if (!obj1.hasOwnProperty(key)) {
			if (typeof obj2[key] === 'object') {
				const nestedChanges = getChangedKeys({}, obj2[key], currentKey);
				changedKeys.push(...nestedChanges);
			}
			else {
				changedKeys.push({ path: currentKey, oldValue: undefined, newValue: obj2[key] });
			}
		}
	}

	return changedKeys;
};
