import { SignalWatcher } from '@lit-labs/preact-signals';
import { emitEvent, type EventOf } from '@roenlie/mimic-core/dom';
import { camelCaseToWords } from '@roenlie/mimic-core/string';
import { throttle } from '@roenlie/mimic-core/timing';
import { MMButton } from '@roenlie/mimic-elements/button';
import { MMInput } from '@roenlie/mimic-elements/input';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';

import type { CampaignTracker, CommonBonesOreAndHides } from '../campaign-tracker.js';

MMInput.register();
MMButton.register();


@SignalWatcher
@customElement('mh-campaign-inventory')
export class CampaignInventory extends MimicElement {

	@property({ type: Object }) public campaignTracker: CampaignTracker;


	protected get current() {
		return this.campaignTracker.currentCampaignDay;
	}

	protected saveAndUpdate() {
		this.campaignTracker.saveCampaign();
		emitEvent(this, 'campaign-saved');
	}

	protected renderNotes() {
		return html`
		<h3>
			Notes
		</h3>
		<s-textarea>
			<textarea
				spellcheck =false
				placeholder="Notes on todays campaign day"
				.value     =${ live(this.current.notes) }
				@change    =${ (ev: EventOf<HTMLTextAreaElement>) => {
					this.current.notes = ev.target.value;
					this.saveAndUpdate();
				} }
			></textarea>
		</s-textarea>
		`;
	}

	protected renderCommonBonesOreAndHides() {
		const { commonBonesOreAndHides } = this.current;

		return html`
		<h3>
			Common Bones, Ore and Hides.
		</h3>
		<s-input-wrapper>
			${ repeat(Object.keys(commonBonesOreAndHides) as any, k => k, (key: keyof CommonBonesOreAndHides) => html`
			<s-incr-field>
				<mm-input
					readonly
					label  =${ camelCaseToWords(key) }
					type   ="number"
					.value =${ commonBonesOreAndHides[key].toString() }
					@change=${ (ev: EventOf<MMInput>) =>{
						commonBonesOreAndHides[key] = ev.target.valueAsNumber;
						this.saveAndUpdate();
					} }
				></mm-input>

				<mm-button type="icon" size="small" @click=${ () => {
					commonBonesOreAndHides[key] += 1;
					this.saveAndUpdate();
				} }>
					<mm-icon url="https://icons.getbootstrap.com/assets/icons/plus-lg.svg"></mm-icon>
				</mm-button>

				<mm-button type="icon" size="small" @click=${ () => {
					const val = commonBonesOreAndHides[key];
					commonBonesOreAndHides[key] = Math.max(0, val - 1);
					this.saveAndUpdate();
				} }>
					<mm-icon url="https://icons.getbootstrap.com/assets/icons/dash-lg.svg"></mm-icon>
				</mm-button>
			</s-incr-field>
			`) }
		</s-input-wrapper>
		`;
	}

	protected toggleDisabled = throttle((el: LitElement | undefined, force?: boolean) => {
		el?.toggleAttribute('disabled', force);
		this.requestUpdate();
	}, 0);

	protected renderItem(options: {
		key: {label?: string, value: string},
		value: string | undefined,
		onDelete: () => void,
		onKeyChange: (ev: EventOf<MMInput>) => void,
		onIncrement?: (ev: PointerEvent) => void,
		onDecrement?: (ev: PointerEvent) => void,
	}) {
		return html`
		<s-record>
			<mm-button
				type="icon"
				size="x-small"
				@click=${ options.onDelete }
			>
				<mm-icon
					url="https://icons.getbootstrap.com/assets/icons/dash-square.svg"
				></mm-icon>
			</mm-button>

			<mm-input
				placeholder=${ options.key.label ?? 'Item Name' }
				.value     =${ options.key.value }
				@change    =${ options.onKeyChange }
			>
				${ when(options.value, () => html`
				<s-count slot="end">
					${ options.value }
				</s-count>
				`) }
			</mm-input>

			${ when(options.onIncrement, () => html`
			<mm-button type="icon" size="small" @click=${ options.onIncrement }>
				<mm-icon url="https://icons.getbootstrap.com/assets/icons/plus-lg.svg"></mm-icon>
			</mm-button>
			`) }

			${ when(options.onDecrement, () => html`
			<mm-button type="icon" size="small" @click=${ options.onDecrement }>
				<mm-icon url="https://icons.getbootstrap.com/assets/icons/dash-lg.svg"></mm-icon>
			</mm-button>
			`) }
		</s-record>
		`;
	}

	protected renderOtherBonesOreAndHides() {
		return html`
		<h3>
			Other Bones, Ore and Hides.
		</h3>
		${ map(this.current.otherBonesOreAndHides, (item, i) => {
			return this.renderItem({
				key:         { value: item.key },
				value:       item.value?.toString() ?? '',
				onKeyChange: ev => {
					item.key = ev.target.value;
					this.saveAndUpdate();
				},
				onIncrement: () => {
					item.value += 1;
					this.saveAndUpdate();
				},
				onDecrement: () => {
					item.value = Math.max(0, item.value - 1);
					this.saveAndUpdate();
				},
				onDelete: () => {
					const remove = confirm('Delete item?');
					if (!remove)
						return;

					this.current.otherBonesOreAndHides.splice(i, 1);
					this.saveAndUpdate();
				},
			});
		}) }
		<mm-button class="add-button" size="small" @click=${ () => {
			this.current.otherBonesOreAndHides.push({ key: '', value: 0 });
			this.saveAndUpdate();
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
			${ this.renderItem({
				key:         { label: 'Monster Name', value: monster.key },
				value:       undefined,
				onKeyChange: ev => {
					monster.key = ev.target.value;
					monster.value ??= [];
					this.saveAndUpdate();
				},
				onDelete: () => {
					const remove = confirm('Delete monster?');
					if (!remove)
						return;

					this.current.monsterParts.splice(mIndex, 1);
					this.saveAndUpdate();
				},
			}) }
			<s-monster-parts>
			${ map(monster.value ?? [], (item, iItem) => {
				return this.renderItem({
					key:         { value: item.key },
					value:       item.value.toString() ?? '',
					onKeyChange: ev => {
						item.key = ev.target.value;
						this.saveAndUpdate();
					},
					onIncrement: () => {
						item.value += 1;
						this.saveAndUpdate();
					},
					onDecrement: () => {
						item.value = Math.max(0, item.value - 1);
						this.saveAndUpdate();
					},
					onDelete: () => {
						const remove = confirm('Delete item?');
						if (!remove)
							return;

						monster.value?.splice(iItem, 1);
						this.saveAndUpdate();
					},
				});
			}) }
			</s-monster-parts>

			<mm-button class="add-button" size="small" @click=${ () => {
				monster.value?.push({ key: '', value: 0 });
				this.saveAndUpdate();
			} }>
				Add Item
			</mm-button>
			`;
		}) }
		<mm-button class="add-button" size="small" @click=${ () => {
			this.current.monsterParts.push({ key: '', value: [] });
			this.saveAndUpdate();
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
			return this.renderItem({
				key:         { value: item.key },
				value:       item.value.toString() ?? '',
				onKeyChange: ev => {
					item.key = ev.target.value;
					this.saveAndUpdate();
				},
				onIncrement: () => {
					item.value += 1;
					this.saveAndUpdate();
				},
				onDecrement: () => {
					item.value = Math.max(0, item.value - 1);
					this.saveAndUpdate();
				},
				onDelete: () => {
					const remove = confirm('Delete item?');
					if (!remove)
						return;

					this.current.inventory.splice(i, 1);
					this.saveAndUpdate();
				},
			});
		}) }
		<mm-button class="add-button" size="small" @click=${ () => {
			this.current.inventory.push({ key: '', value: 0 });
			this.saveAndUpdate();
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
		<hr>
		${ this.renderNotes() }
		<hr>
		${ this.renderCommonBonesOreAndHides() }
		<hr>
		${ this.renderOtherBonesOreAndHides() }
		<hr>
		${ this.renderMonsterParts() }
		<hr>
		${ this.renderInventory() }
		<hr>
		<h3>
			Party items
		</h3>
		<mm-input
			label="health potions"
			@change=${ (ev: EventOf<HTMLInputElement>) => {
				this.current.healthPotions = Number(ev.target.value);
				this.saveAndUpdate();
			} }
		></mm-input>
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
		s-textarea {
			overflow: hidden;
			display: grid;
			height: 200px;
		}
		textarea {
			all: unset;
			color: rgb(var(--mm-color-on-surface) / 0.87);
			background-color: rgb(var(--mm-color-on-surface) / .04);
			border-bottom: 1px solid rgb(var(--mm-color-on-surface) / 0.6);
			padding-block: 6px;
			padding-inline: 12px;
		}
		textarea::placeholder {
			color: rgb(var(--mm-color-on-surface) / 0.6);
		}
		s-input-wrapper {
			display: grid;
			gap: 8px;
		}
		s-record {
			display: grid;
			grid-template-columns: max-content 1fr max-content max-content;
			align-items: center;
			gap: 8px;
		}
		s-count {
			display: grid;
			place-items: center;
			padding: 4px;
			border-left: 1px solid rgb(var(--mm-color-on-surface) / 0.6);
			width: 3ch;
			height: 100%;
		}
		s-incr-field {
			display: grid;
			grid-template-columns: 1fr max-content max-content;
			align-items: center;
			gap: 12px;
		}
		.add-button {
			margin-top: 24px;
		}
		`,
	];

}
