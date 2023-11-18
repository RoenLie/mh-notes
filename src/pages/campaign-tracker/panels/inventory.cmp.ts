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
import { when } from 'lit/directives/when.js';

import type { CampaignTracker } from '../campaign-tracker.js';

MMInput.register();
MMButton.register();


@SignalWatcher
@customElement('mh-campaign-inventory')
export class CampaignInventory extends MimicElement {

	@property({ type: Object }) public campaignTracker: CampaignTracker;

	protected get current() {
		return this.campaignTracker.currentCampaignDay;
	}

	protected renderCommonBonesOreAndHides() {
		return html`
		<h3>
			Common Bones, Ore and Hides.
		</h3>
		<s-input-wrapper>
			${ map(Object.keys(this.current.commonBonesOreAndHides), key => html`
			<mm-input
				label=${ camelCaseToWords(key) }
				.value=${ (this.current.commonBonesOreAndHides as any)[key].toString() }
				@change=${ (ev: EventOf<HTMLInputElement>) =>{
					(this.current.commonBonesOreAndHides as any)[key] = parseInt(ev.target.value || '0');
					this.requestUpdate();
				} }
			></mm-input>
			`) }
		</s-input-wrapper>
		`;
	}

	protected renderItem(
		key: string,
		value: string | undefined,
		onKeyChange: (ev: EventOf<HTMLInputElement>) => void,
		onValueChange: (ev: EventOf<HTMLInputElement>) => void,
		onDelete: () => void,
	) {
		const elRef = createRef<HTMLElement>();

		return html`
		<s-record>
			<mm-input
				${ ref(elRef) }
				label="Item Name"
				.value=${ key }
				disabled
				@change=${ onKeyChange }
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

			${ when(value !== undefined, () => html`
			<mm-input
				label="Amount"
				.value=${ value }
				@change=${ onValueChange }
			></mm-input>
			`) }

			<mm-button
				type="icon"
				size="small"
				@click=${ onDelete }
			>
				<mm-icon
					url="https://icons.getbootstrap.com/assets/icons/dash-square.svg"
				></mm-icon>
			</mm-button>
		</s-record>
		`;
	}

	protected renderOtherBonesOreAndHides() {
		return html`
		<h3>
			Other Bones, Ore and Hides.
		</h3>
		${ map(Object.keys(this.current.otherBonesOreAndHides), key => {
			return this.renderItem(
				key,
				this.current.otherBonesOreAndHides[key]?.toString() ?? '',
				ev => {
					const value = this.current.otherBonesOreAndHides[key] ??= 0;
					delete this.current.otherBonesOreAndHides[key];
					this.current.otherBonesOreAndHides[ev.target.value] = value;
					this.requestUpdate();
				},
				ev => {
					this.current.otherBonesOreAndHides[key] = parseInt(ev.target.value || '0');
					this.requestUpdate();
				},
				() => {
					const remove = confirm('Delete item?');
					if (!remove)
						return;

					delete this.current.otherBonesOreAndHides[key];
					this.requestUpdate();
				},
			);
		}) }
		<mm-button class="add-button" size="small" @click=${ () => {
			this.current.otherBonesOreAndHides[''] = 0;
			this.requestUpdate();
		} }>
			Add Item
		</mm-button>
		`;
	}

	protected renderMonsterParts() {
		return html`
		<h3>
			Monster Parts
		</h3>
		${ map(Object.keys(this.current.monsterParts), monster => {
			return html`
			${ this.renderItem(
				monster,
				undefined,
				ev => {
					const value = this.current.monsterParts[monster] ??= {};
					delete this.current.monsterParts[monster];
					this.current.monsterParts[ev.target.value] = value;
					this.requestUpdate();
				},
				() => {},
				() => {
					const remove = confirm('Delete monster?');
					if (!remove)
						return;

					delete this.current.monsterParts[monster];
					this.requestUpdate();
				},
			) }
			<s-monster-parts>
			${ map(Object.keys(this.current.monsterParts[monster] ?? {}), itemname => {
				return this.renderItem(
					itemname,
					this.current.monsterParts[itemname]?.[itemname]?.toString() ?? '',
					ev => {
						const monsterRec = this.current.monsterParts[monster] ??= {};
						const value = monsterRec[itemname] ?? 0;

						delete monsterRec[itemname];
						monsterRec[ev.target.value] = value;
						this.requestUpdate();
					},
					ev => {
						(this.current.monsterParts[monster] ??= {})[itemname] = parseInt(ev.target.value || '0');
						this.requestUpdate();
					},
					() => {
						const remove = confirm('Delete item?');
						if (!remove)
							return;

						delete this.current.monsterParts[monster]?.[itemname];
						this.requestUpdate();
					},
				);
			}) }
			</s-monster-parts>

			<mm-button class="add-button" size="small" @click=${ () => {
				(this.current.monsterParts[monster] ??= {})[''] = 0;
				this.requestUpdate();
			} }>
				Add Item
			</mm-button>
			`;
		}) }
		<mm-button class="add-button" size="small" @click=${ () => {
			this.current.monsterParts[''] ??= {};
			this.requestUpdate();
		} }>
			Add Monster
		</mm-button>
		`;
	}

	protected renderInventory() {
		return html`
		<h3>
			Inventory
		</h3>
		${ map(Object.keys(this.current.inventory), key => {
			return this.renderItem(
				key,
				this.current.inventory[key]?.toString() ?? '',
				ev => {
					const value = this.current.inventory[key] ??= 0;
					delete this.current.inventory[key];
					this.current.inventory[ev.target.value] = value;
					this.requestUpdate();
				},
				ev => {
					this.current.inventory[key] = parseInt(ev.target.value);
					this.requestUpdate();
				},
				() => {
					const remove = confirm('Delete item?');
					if (!remove)
						return;

					delete this.current.inventory[key];
					this.requestUpdate();
				},
			);
		}) }
		<mm-button class="add-button" size="small" @click=${ () => {
			this.current.inventory[''] ??= 0;
			this.requestUpdate();
		} }>
			Add Item
		</mm-button>
		`;
	}

	protected override render() {
		return html`
		<mm-input
			label="health potions"
		></mm-input>
		<hr>
		${ this.renderCommonBonesOreAndHides() }
		<hr>
		${ this.renderOtherBonesOreAndHides() }
		<hr>
		${ this.renderMonsterParts() }
		<hr>
		${ this.renderInventory() }
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
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		}
		s-record {
			display: grid;
			grid-template-columns: 2fr 1fr max-content;
			align-items: center;
			gap: 12px;
		}
		s-record mm-button {
			grid-column: 3/4;
		}
		.add-button {
			padding-top: 24px;
		}
		`,
	];

}
