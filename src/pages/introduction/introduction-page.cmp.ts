import { customElement, MimicElement } from '@roenlie/mimic-lit/element';
import { sharedStyles } from '@roenlie/mimic-lit/styles';
import { css, html } from 'lit';


@customElement('mh-introduction-page')
export class IntroductionPage extends MimicElement {

	public static page = true;

	protected override render(): unknown {
		return html`
		<h1>Welcome to Monster Hunter Campaign Tracker</h1>

		<h2>About the App</h2>

		<p>Greetings, Hunters!</p>

		<p>
			Embark on your epic journey in the Monster Hunter world with our dedicated campaign tracker.
			This web app is your ultimate companion, designed to streamline and enhance your Monster Hunter tabletop experience.
			Whether you're a seasoned hunter or just starting your first campaign, our tools are here to make managing your adventures a breeze.
		</p>

		<h2>Key Features</h2>

		<ul>
			<li>
				<strong>Campaign Overview:</strong>
				Keep track of your entire campaign at a glance, including quest progress,
				notable monsters encountered, and current objectives.
			</li>
			<li>
				<strong>Inventory Management:</strong>
				Manage your hunter's inventory with ease. Keep track of weapons, armor,
				consumables, and more. Never forget your essential gear again!
			</li>
		</ul>

		<h2>Getting Started</h2>

		<ol>
			<li>
				<strong>Start a Campaign:</strong>
				Set up your campaign by providing key details such as the hunter name,
				campaign name, and campaign length.
			</li>
			<li>
				<strong>Update and Explore:</strong>
				Regularly update your campaign progress, manage your inventory,
				and explore the vast world of Monster Hunter with the help of our intuitive tools.
			</li>
		</ol>

		<h2>Why Choose Our Campaign Tracker?</h2>

		<ul>
			<li>
				<strong>User-Friendly Interface:</strong>
				Our app is designed with simplicity in mind, ensuring a smooth and enjoyable
				user experience.
			</li>
			<li>
				<strong>Cross-Device Accessibility:</strong>
				Access your campaign data from your computer, tablet, or smartphone,
				allowing you to plan your next hunt anytime, anywhere.
			</li>
			<li>
				<strong>Constant Updates:</strong>
				We're committed to improving and expanding our features based on user
				feedback and the evolving Monster Hunter universe.
			</li>
		</ul>

		<p>
			Join the ranks of hunters who trust our Monster Hunter Campaign Tracker
			to enhance their tabletop adventures.
			Start your campaign today and forge your legend in the world of monsters!
		</p>

		<br>

		<p>Happy Hunting! 🦖🌟</p>
		`;
	}

	public static override styles = [
		sharedStyles,
		css`
		:host {
			display: grid;
			grid-auto-rows: max-content;
			padding-block: 32px;
			padding-inline: 22px;
			overflow: scroll;
			font-size: 14px;

			--scrollbar-thumb-bg: var(--md-surface-container-highest);
			--scrollbar-width: 2px;
		}
		ol, ul, li {
			all: unset;
			display: block;
		}
		li {
			margin-bottom: 10px;
		}

		h1, h2, h3, h4, h5, h6 {
			color: var(--md-primary);
			padding-top: 16px;
			padding-bottom: 8px;
		}
		p {
			color: var(--md-tertiary);
		}
		li {
			color: var(--md-tertiary);
		}
		li strong {
			color: var(--md-on-tertiary-container);
		}
		`,
	];

}
