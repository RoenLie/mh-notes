import { SignalWatcher } from '@lit-labs/preact-signals';
import { debounce } from '@roenlie/mimic-core/timing';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';
import { eventOptions, query, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';

import { CampaignTracker } from './campaign-tracker.js';
import { CampaignCharacter } from './character.cmp.js';
import { CampaignDaySelector } from './day-selector.cmp.js';
import { CampaignInventory } from './inventory.cmp.js';

CampaignDaySelector.register();
CampaignCharacter.register();
CampaignInventory.register();


@SignalWatcher
@customElement('mh-campaign-tracker-page')
export class CampaignTrackerPage extends MimicElement {

	public static page = true;

	@state() protected scrollStopStart = 0;
	@state() protected scrollStopEnd = Infinity;
	@query('s-scroll-wrapper') protected scrollWrapper: HTMLElement;

	protected campaignTracker = new CampaignTracker(
		new URL(location.href).searchParams.get('campaign') ?? '',
	);

	protected isScrolling = false;
	protected panelTags = [
		unsafeStatic(CampaignDaySelector.tagName),
		unsafeStatic(CampaignCharacter.tagName),
		unsafeStatic(CampaignInventory.tagName),
	];

	public override connectedCallback() {
		super.connectedCallback();
	}

	public override afterConnectedCallback() {
		requestAnimationFrame(() => this.scrollStopEnd = this.scrollWrapper.offsetWidth);
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();
	}

	@eventOptions({ passive: true })
	protected handleScroll(ev: Event & {target: HTMLElement}) {
		this.isScrolling = true;

		const target = ev.target;
		if (target.scrollLeft >= this.scrollStopEnd) {
			target.style.setProperty('overflow', 'hidden');
			target.scrollLeft = this.scrollStopEnd;
		}
		else if (target.scrollLeft <= this.scrollStopStart) {
			target.style.setProperty('overflow', 'hidden');
			target.scrollLeft = this.scrollStopStart;
		}

		this.handleScrollStop();
	}

	protected handleScrollStop = debounce(() => {
		const scrollEl = this.scrollWrapper;
		const widthPerPage = scrollEl.offsetWidth;
		const currentPage = Math.round(scrollEl.scrollLeft / widthPerPage);

		this.scrollStopStart = Math.max(0, (currentPage - 1) * widthPerPage);
		this.scrollStopEnd = Math.min(scrollEl.scrollWidth, (currentPage + 1) * widthPerPage);

		this.scrollWrapper.style.removeProperty('overflow');
		this.isScrolling = false;
	}, 25);

	protected handleTouchstart(ev: TouchEvent) {
		if (this.isScrolling)
			ev.preventDefault();
	}

	protected override render() {
		return html`
		<s-scroll-wrapper
			@scroll=${ this.handleScroll }
			@touchstart=${ this.handleTouchstart }
		>
			${ map(this.panelTags, panel => staticHtml`
			<${ panel }></${ panel }>
			`) }
		</s-scroll-wrapper>
		`;
	}

	public static override styles = [
		sharedStyles,
		css`
		:host {
			overflow: hidden;
			display: grid;
		}
		s-scroll-wrapper {
			overflow-y: hidden;
			overflow-x: scroll;
			display: grid;
			grid-auto-flow: column;
			grid-auto-columns: 100vw;
			scroll-snap-type: x mandatory;
		}
		s-scroll-wrapper::-webkit-scrollbar {
			display: none;
		}
		s-scroll-wrapper > * {
			scroll-snap-align: start;
			overscroll-behavior-y: contain;
			overscroll-behavior-x: auto;
		}
		`,
	];

}
