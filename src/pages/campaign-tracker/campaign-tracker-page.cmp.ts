import { SignalWatcher } from '@lit-labs/preact-signals';
import { scrollElementTo } from '@roenlie/mimic-core/dom';
import { debounce } from '@roenlie/mimic-core/timing';
import { MMButton } from '@roenlie/mimic-elements/button';
import { MMIcon } from '@roenlie/mimic-elements/icon';
import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html, LitElement } from 'lit';
import { eventOptions, query, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js';

import { navigate, SearchParams } from '../../features/router/navigate.js';
import { CampaignTracker } from './campaign-tracker.js';
import { CampaignOverview } from './panels/campaign-overview.cmp.js';
import { CampaignDaySelector } from './panels/day-selector.cmp.js';
import { CampaignHuntersLog } from './panels/hunters-log.cmp.js';
import { CampaignInventory } from './panels/inventory.cmp.js';

MMButton.register();
MMIcon.register();
CampaignDaySelector.register();
CampaignOverview.register();
CampaignInventory.register();
CampaignHuntersLog.register();


@SignalWatcher
@customElement('mh-campaign-tracker-page')
export class CampaignTrackerPage extends MimicElement {

	public static page = true;

	@state() protected scrollStopStart = 0;
	@state() protected scrollStopEnd = Infinity;
	@query('s-scroll-wrapper') protected scrollWrapper?: HTMLElement;

	protected campaignTracker = new CampaignTracker(SearchParams.get('campaign-id'));
	protected isScrolling = false;
	protected allowFreeScroll = false;
	protected panels = [
		{
			name:    'campaign',
			tag:     unsafeStatic(CampaignOverview.tagName),
			iconUrl: 'https://icons.getbootstrap.com/assets/icons/person-wheelchair.svg',
		},
		{
			name:    'day-selector',
			tag:     unsafeStatic(CampaignDaySelector.tagName),
			iconUrl: 'https://icons.getbootstrap.com/assets/icons/calendar-week.svg',
		},
		{
			name:    'inventory',
			tag:     unsafeStatic(CampaignInventory.tagName),
			iconUrl: 'https://icons.getbootstrap.com/assets/icons/safe2.svg',
		},
		{
			name:    'hunters-log',
			tag:     unsafeStatic(CampaignHuntersLog.tagName),
			iconUrl: 'https://icons.getbootstrap.com/assets/icons/journal-text.svg',
		},
	];

	protected get activePanel() {
		const scrollEl = this.scrollWrapper;
		if (!scrollEl)
			return 0;

		const widthPerPage = scrollEl.offsetWidth;
		const currentPage = Math.round(scrollEl.scrollLeft / widthPerPage);

		return currentPage;
	}

	public override connectedCallback() {
		super.connectedCallback();
		this.style.setProperty('opacity', '0');
		this.campaignTracker.loadCampaign();
	}

	public override afterConnectedCallback() {
		const panel = SearchParams.get('panel');
		const page = this.panels.findIndex(p => p.name === panel) || 0;

		requestAnimationFrame(async () => {
			await this.scrollToPage(page, 1);
			this.handleScrollStop();
			this.style.removeProperty('opacity');
		});
	}

	public override disconnectedCallback() {
		super.disconnectedCallback();
	}

	protected async scrollToPage(page: number, duration?: number) {
		const scrollEl = this.scrollWrapper;
		if (!scrollEl)
			return;

		const widthPerPage = scrollEl.offsetWidth;
		const scrollTarget = widthPerPage * page;

		this.allowFreeScroll = true;

		this.scrollStopStart = Math.max(0, (page - 1) * widthPerPage);
		this.scrollStopEnd = Math.min(scrollEl.scrollWidth, (page + 1) * widthPerPage);

		scrollEl.style.setProperty('scroll-snap-type', 'none');
		await scrollElementTo(scrollEl, { duration: duration ?? 500, x: scrollTarget });
		this.allowFreeScroll = false;

		scrollEl.style.removeProperty('scroll-snap-type');
		this.requestUpdate();
	}

	@eventOptions({ passive: true })
	protected handleScroll(ev: Event & {target: HTMLElement}) {
		if (this.allowFreeScroll)
			return;

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
		if (!scrollEl)
			return;

		const widthPerPage = scrollEl.offsetWidth;
		const currentPage = Math.round(scrollEl.scrollLeft / widthPerPage);

		this.scrollStopStart = Math.max(0, (currentPage - 1) * widthPerPage);
		this.scrollStopEnd = Math.min(scrollEl.scrollWidth, (currentPage + 1) * widthPerPage);

		scrollEl.style.removeProperty('overflow');
		this.isScrolling = false;

		const panel = this.panels[currentPage];
		if (panel)
			navigate({ search: { panel: panel.name } });
	}, 25);

	protected handleTouchstart(ev: TouchEvent) {
		if (this.isScrolling)
			ev.preventDefault();
	}

	protected handleSubnavClick(index: number) {
		const panel = this.panels[index];
		if (!panel)
			return;

		navigate({ search: { panel: panel.name } });
		this.scrollToPage(index);
	}

	protected override render() {
		return html`
		<s-subnav>
			${ map(this.panels, (nav, i) => html`
			${ when(Math.ceil(this.panels.length / 2) === i, () => html`
			<s-day-indicator>
				Day: ${ this.campaignTracker.day }
			</s-day-indicator>
			`) }

			<mm-button
				type="icon"
				shape="rounded"
				size="small"
				variant=${ this.activePanel === i ? 'primary' : 'outline' }
				@click=${ () => this.handleSubnavClick(i) }
			>
				<mm-icon
					url=${ nav.iconUrl }
				></mm-icon>
			</mm-button>
			`) }
		</s-subnav>

		<s-scroll-wrapper
			@scroll=${ this.handleScroll }
			@touchstart=${ this.handleTouchstart }
			@campaign-saved=${ () => {
				this.panels.forEach(panel => {
					const el = this.shadowRoot
						?.querySelector(panel.tag._$litStatic$) as undefined | LitElement;

					el?.requestUpdate();
				});
			} }
		>
			${ map(this.panels, panel => staticHtml`
			<${ panel.tag }
				.campaignTracker=${ this.campaignTracker }
			></${ panel.tag }>
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
			grid-template-rows: max-content 1fr;
		}
		s-subnav {
			display: grid;
			height: 50px;
			color: var(--md-on-surface);
			background-color: var(--md-surface);
			border-bottom: 2px solid var(--md-surface-container-highest);

			grid-auto-flow: column;
			grid-auto-columns: 1fr;
			place-items: center;
			padding-inline: 24px;
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
			padding-bottom: 30vh;
		}
		s-day-indicator {
			white-space: nowrap;
		}
		`,
	];

}
