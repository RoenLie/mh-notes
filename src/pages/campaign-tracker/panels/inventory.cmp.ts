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
import { createRef, type Ref, ref } from 'lit/directives/ref.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';

import type { CampaignTracker } from '../campaign-tracker.js';

MMInput.register();
MMButton.register();


@SignalWatcher
@customElement('mh-campaign-inventory')
export class CampaignInventory extends MimicElement {

	@property({ type: Object }) public campaignTracker: CampaignTracker;

	protected refMap = new Map<string, Ref<HTMLElement>>();

	protected get current() {
		return this.campaignTracker.currentCampaignDay;
	}

	public override disconnectedCallback(): void {
		super.disconnectedCallback();

		this.refMap.clear();
	}

	protected renderCommonBonesOreAndHides() {
		return html`
		<h3>
			Common Bones, Ore and Hides.
		</h3>
		<s-input-wrapper>
			${ repeat(Object.keys(this.current.commonBonesOreAndHides), k => k, key => html`
			<mm-input
				label  =${ camelCaseToWords(key) }
				type   ="number"
				.value =${ (this.current.commonBonesOreAndHides as any)[key].toString() }
				@change=${ (ev: EventOf<MMInput>) =>{
					(this.current.commonBonesOreAndHides as any)[key] = ev.target.valueAsNumber;
					this.requestUpdate();
				} }
			></mm-input>
			`) }
		</s-input-wrapper>
		`;
	}

	protected renderItem(
		id: string,
		key: {label?: string, value: string},
		value: string | undefined,
		onKeyChange: (ev: EventOf<MMInput>) => void,
		onValueChange: (ev: EventOf<MMInput>) => void,
		onDelete: () => void,
	) {
		const elRef = this.refMap.get(id) ??
			(() => this.refMap.set(id, createRef<HTMLElement>()).get(id)!)();

		const isDisabled = elRef.value?.hasAttribute('disabled') ?? true;

		return html`
		<s-record>
			<mm-input
				${ ref(elRef) }
				label=${ key.label ?? 'Item Name' }
				.value=${ key.value }
				disabled
				@change=${ onKeyChange }
			>
				<mm-button
					slot="end"
					type="icon"
					size="x-small"
					variant="elevated"
					@click=${ () => {
						elRef.value?.toggleAttribute('disabled');
						this.requestUpdate();
					} }
				>
					${ when(isDisabled, () => html`
					<mm-icon url="https://icons.getbootstrap.com/assets/icons/lock.svg"></mm-icon>
					`, () => html`
					<mm-icon url="https://icons.getbootstrap.com/assets/icons/unlock.svg"></mm-icon>
					`) }
				</mm-button>
			</mm-input>

			${ when(value !== undefined, () => html`
			<mm-input
				label  ="Amount"
				type   ="number"
				.value =${ value! }
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
		${ map(this.current.otherBonesOreAndHides, (item, i) => {
			return this.renderItem(
				'otherBonesOreAndHides-' + i,
				{ value: item.key },
				item.value?.toString() ?? '',
				ev => {
					item.key = ev.target.value;
					this.requestUpdate();
				},
				ev => {
					item.value = Number(ev.target.value);
					this.requestUpdate();
				},
				() => {
					const remove = confirm('Delete item?');
					if (!remove)
						return;

					this.current.otherBonesOreAndHides.splice(i, 1);
					this.requestUpdate();
				},
			);
		}) }
		<mm-button class="add-button" size="small" @click=${ () => {
			this.current.otherBonesOreAndHides.push({ key: '', value: 0 });
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
		${ map(this.current.monsterParts, (monster, mIndex) => {
			return html`
			${ this.renderItem(
				'monsterParts-' + mIndex,
				{ label: 'Monster Name', value: monster.key },
				undefined,
				ev => {
					monster.key = ev.target.value;
					monster.value ??= [];
					this.requestUpdate();
				},
				() => {},
				() => {
					const remove = confirm('Delete monster?');
					if (!remove)
						return;

					this.current.monsterParts.splice(mIndex, 1);
					this.requestUpdate();
				},
			) }
			<s-monster-parts>
			${ map(monster.value ?? [], (item, iItem) => {
				return this.renderItem(
					monster + '-' + iItem,
					{ value: item.key },
					item.value.toString() ?? '',
					ev => {
						item.key = ev.target.value;
						this.requestUpdate();
					},
					ev => {
						item.value = Number(ev.target.value);
						this.requestUpdate();
					},
					() => {
						const remove = confirm('Delete item?');
						if (!remove)
							return;

						monster.value?.splice(iItem, 1);
						this.requestUpdate();
					},
				);
			}) }
			</s-monster-parts>

			<mm-button class="add-button" size="small" @click=${ () => {
				monster.value?.push({ key: '', value: 0 });
				this.requestUpdate();
			} }>
				Add Item
			</mm-button>
			`;
		}) }
		<mm-button class="add-button" size="small" @click=${ () => {
			this.current.monsterParts.push({ key: '', value: [] });
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
		${ map(this.current.inventory, (item, i) => {
			return this.renderItem(
				'inventory-' + i,
				{ value: item.key },
				item.value.toString() ?? '',
				ev => {
					item.key = ev.target.value;
					this.requestUpdate();
				},
				ev => {
					item.value = Number(ev.target.value);
					this.requestUpdate();
				},
				() => {
					const remove = confirm('Delete item?');
					if (!remove)
						return;

					this.current.inventory.splice(i, 1);
					this.requestUpdate();
				},
			);
		}) }
		<mm-button class="add-button" size="small" @click=${ () => {
			this.current.inventory.push({ key: '', value: 0 });
			this.requestUpdate();
		} }>
			Add Item
		</mm-button>
		`;
	}

	protected override render() {
		return html`
		<h2>
			Inventory
		</h2>
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
			gap: 8px;

			--scrollbar-thumb-bg: var(--md-surface-container-highest);
			--scrollbar-width: 2px;
		}
		h2 {
			justify-self: center;
			padding-block: 12px;
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
			grid-template-columns: 1fr 60px max-content;
			align-items: center;
			gap: 12px;
		}
		s-record mm-input:first-of-type:last-of-type {
			grid-column: span 2;
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
