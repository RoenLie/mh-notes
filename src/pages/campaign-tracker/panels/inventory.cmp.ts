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
import { createRef, ref } from 'lit/directives/ref.js';

import type { CampaignTracker, CommonBonesOreAndHides } from '../campaign-tracker.js';

MMInput.register();
MMButton.register();


@SignalWatcher
@customElement('mh-campaign-inventory')
export class CampaignInventory extends MimicElement {

	@property({ type: Object }) public campaignTracker: CampaignTracker;

	protected override render() {
		const current = this.campaignTracker.currentCampaignDay;

		return html`
		<mm-input
			label="health potions"
		></mm-input>
		<hr>

		<h3>
			Common Bones, Ore and Hides.
		</h3>
		<s-input-wrapper>
			${ map(Object.keys(current.commonBonesOreAndHides), key => html`
			<mm-input
				label=${ camelCaseToWords(key) }
				.value=${ current.commonBonesOreAndHides[key as keyof CommonBonesOreAndHides].toString() }
			></mm-input>
			`) }
		</s-input-wrapper>
		<hr>

		<h3>
			Other Bones, Ore and Hides.
		</h3>
		${ map(Object.keys(current.otherBonesOreAndHides), key => {
			const elRef = createRef<HTMLElement>();

			return html`
			<s-record>
				<mm-input
					${ ref(elRef) }
					label="Item Name"
					.value=${ key }
					disabled
					@change=${ (ev: EventOf<MMInput>) => {
						const value = current.otherBonesOreAndHides[key] ?? 0;
						delete current.otherBonesOreAndHides[key];
						current.otherBonesOreAndHides[ev.target.value] = value;
						this.requestUpdate();
					} }
				>
					<mm-button
						slot="end"
						type="icon"
						size="x-small"
						variant="elevated"
						@click=${ () => elRef.value?.toggleAttribute('disabled') }
					>
						<mm-icon
							url="https://icons.getbootstrap.com/assets/icons/lock.svg"
						></mm-icon>
					</mm-button>
				</mm-input>

				<mm-input
					label="Amount"
					.value=${ current.otherBonesOreAndHides[key]?.toString() ?? '' }
					@change=${ (ev: EventOf<MMInput>) => {
						current.otherBonesOreAndHides[key] = parseInt(ev.target.value);
						this.requestUpdate();
					} }
				></mm-input>

				<mm-button
					type="icon"
					size="small"
					@click=${ () => {
						const remove = confirm('Delete item?');
						if (!remove)
							return;

						delete current.otherBonesOreAndHides[key];
						this.requestUpdate();
					} }
				>
					<mm-icon
						url="https://icons.getbootstrap.com/assets/icons/dash-square.svg"
					></mm-icon>
				</mm-button>
			</s-record>
			`;
		}) }
		<mm-button @click=${ () => {
			current.otherBonesOreAndHides[''] = 0;
			this.requestUpdate();
		} }>
			Add Item
		</mm-button>

		<hr>

		<h3>
			Monster Parts
		</h3>
		${ map(Object.keys(current.otherBonesOreAndHides), key => html`

		`) }
		<mm-button>
			Add Item
		</mm-button>
		<hr>

		<h3>
			Inventory
		</h3>
		${ map(Object.keys(current.otherBonesOreAndHides), key => html`

		`) }
		<mm-button>
			Add Item
		</mm-button>
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
		h3, mm-button {
			justify-self: center;
		}
		hr {
			width: 100%;
			border: 1px solid var(--md-surface-container-highest);
		}
		s-input-wrapper {
			display: grid;
			place-content: center;
			gap: 8px;
			grid-template-columns: repeat(auto-fit, minmax(90px, 150px));
		}
		s-record {
			display: grid;
			grid-template-columns: 2fr 1fr max-content;
			align-items: center;
			gap: 12px;
		}
		`,
	];

}
