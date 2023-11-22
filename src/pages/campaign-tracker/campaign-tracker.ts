import { Signal, signal } from '@lit-labs/preact-signals';
import { storageHandler } from '@roenlie/mimic-core/dom';


export interface CommonBonesOreAndHides {
	carbaliteOre:      number;
	malachiteOre:      number;
	dragoniteOre:      number;
	fuciumOre:         number;
	qualityBone:       number;
	monsterBoneSmall:  number;
	monsterBoneMedium: number;
	monsterBoneLarge:  number;
	monsterKeenbone:   number;
	monsterHardbone:   number;
	ancientBone:       number;
	boulderBone:       number;
	dragonveinCrystal: number;
	wingdrakeHide:     number;
}

export interface Monster {key: string; value: Item[];}
export interface Item {key: string; value: number;}
export type OtherBonesOreAndHides = Item[];
export type MonsterParts = {key: string; value: Item[];}[];
export type Inventory = Item[];

export interface CampaignDay {
	campaignId: string;
	day: number;
	healthPotions: number;
	commonBonesOreAndHides: CommonBonesOreAndHides;
	otherBonesOreAndHides: OtherBonesOreAndHides;
	monsterParts: MonsterParts;
	inventory: Inventory;
	notes: string;
}
export interface Campaign {
	campaignId: string;
	playerName: string;
	campaignName: string;
	hunterName: string;
	palicoName: string;
	campaignLength: number;
	days: CampaignDay[];
	lastUpdated: string;
}


export class CampaignTracker {

	public playerName = '';
	public campaignName = '';
	public hunterName = '';
	public palicoName = '';
	public campaignLength = 20;
	public lastUpdated = new Date().toISOString();
	public day: Signal<number> = signal(1);
	public days: CampaignDay[] = [
		{
			campaignId:             this.campaignId,
			day:                    this.day.value,
			healthPotions:          0,
			inventory:              [],
			monsterParts:           [],
			otherBonesOreAndHides:  [],
			commonBonesOreAndHides: {
				carbaliteOre:      0,
				malachiteOre:      0,
				dragoniteOre:      0,
				fuciumOre:         0,
				qualityBone:       0,
				monsterBoneSmall:  0,
				monsterBoneMedium: 0,
				monsterBoneLarge:  0,
				monsterKeenbone:   0,
				monsterHardbone:   0,
				ancientBone:       0,
				boulderBone:       0,
				dragonveinCrystal: 0,
				wingdrakeHide:     0,
			},
			notes: '',
		},
	];

	public get currentCampaignDay() {
		const current = this.days[this.day.value - 1];
		if (!current)
			throw new Error('Invalid day.');

		return current;
	}

	constructor(public campaignId: string) { }

	public saveCampaign(day?: number) {
		const data: Campaign = {
			campaignId:     this.campaignId,
			campaignLength: this.campaignLength,
			campaignName:   this.campaignName,
			hunterName:     this.hunterName,
			palicoName:     this.palicoName,
			playerName:     this.playerName,
			days:           this.days,
			lastUpdated:    new Date().toISOString(),
		};

		const available = storageHandler.getItem<Campaign[]>('availableCampaigns', []);
		const existing = available.findIndex(c => c.campaignId === this.campaignId);
		if (existing > -1) {
			available[existing] = {
				...available[existing],
				...data,
			};
		}
		else {
			available.push(data);
		}

		storageHandler.setItem('availableCampaigns', available);
		this.loadCampaign(day);
	}

	public loadCampaign(day?: number) {
		const availableCampaigns = storageHandler.getItem<Campaign[]>('availableCampaigns', []);
		const campaign = availableCampaigns.find(c => c.campaignId === this.campaignId);
		if (!campaign)
			return console.error('no campaign found with id: ' + this.campaignId);

		this.days           = campaign.days;
		this.day.value      = day ?? campaign.days.length;
		this.playerName     = campaign.playerName;
		this.hunterName     = campaign.hunterName;
		this.palicoName     = campaign.palicoName;
		this.campaignName   = campaign.campaignName;
		this.campaignLength = campaign.campaignLength;
		this.lastUpdated    = campaign.lastUpdated;

		/** Temp data migration */
		this.days.forEach(day => {
			day.notes ??= '';
		});
	}

	public deleteCampaign() {
		const availableCampaigns = storageHandler.getItem<Campaign[]>('availableCampaigns', []);
		const campaignIndex = availableCampaigns.findIndex(c => c.campaignId === this.campaignId);
		if (campaignIndex > -1)
			availableCampaigns.splice(campaignIndex, 1);

		storageHandler.setItem('availableCampaigns', availableCampaigns);
	}

	public isValidCampaign() {
		return this.playerName
			&& this.campaignName
			&& this.hunterName
			&& this.palicoName
			&& this.campaignLength;
	}

	public newDay() {
		if (this.days.length >= this.campaignLength)
			return console.error('campaign at maximum days.');

		this.days.push({
			...structuredClone(this.days.at(-1))!,
			day: this.days.length + 1,
		});

		this.day.value = this.days.length;
	}

}
