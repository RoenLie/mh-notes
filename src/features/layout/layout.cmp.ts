import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { css, html } from 'lit';

import { NavbarCmp } from './navbar.cmp.js';

NavbarCmp.register();


@customElement('app-layout')
export class AppLayoutCmp extends MimicElement {

	public static page = true;

	protected override render() {
		return html`
		<slot></slot>
		<m-navbar></m-navbar>
		`;
	}

	public static override styles = [
		css`
		:host {
			overflow: hidden;
			display: grid;
			grid-template-rows: 1fr max-content;
			overscroll-behavior: contain;
		}
		m-navbar {
			grid-row: 2/3;
		}
		`,
	];

}
