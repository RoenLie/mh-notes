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
export interface OtherBonesOreAndHides extends Record<string, number> {}
export interface MonsterParts extends Record<string, Record<string, number>> {}
export interface Inventory extends Record<string, number> {}
export interface CampaignDay {
	campaignId: string;
	day: number;
	healthPotions: number;
	commonBonesOreAndHides: CommonBonesOreAndHides;
	otherBonesOreAndHides: OtherBonesOreAndHides;
	monsterParts: MonsterParts;
	inventory: Inventory;
}
export interface Campaign {
	campaignId: string;
	playerName: string;
	campaignName: string;
	hunterName: string;
	palicoName: string;
	campaignLength: number;
	days: CampaignDay[];
}


export class CampaignTracker {

	public playerName = '';
	public campaignName = '';
	public hunterName = '';
	public palicoName = '';
	public campaignLength = 20;
	public day: Signal<number> = signal(1);
	public days: CampaignDay[] = [
		{
			campaignId:             this.campaignId,
			day:                    this.day.value,
			healthPotions:          0,
			inventory:              {},
			monsterParts:           {},
			otherBonesOreAndHides:  {},
			commonBonesOreAndHides: {
				ancientBone:       0,
				boulderBone:       0,
				carbaliteOre:      0,
				dragoniteOre:      0,
				dragonveinCrystal: 0,
				fuciumOre:         0,
				malachiteOre:      0,
				monsterBoneLarge:  0,
				monsterBoneMedium: 0,
				monsterBoneSmall:  0,
				monsterHardbone:   0,
				monsterKeenbone:   0,
				qualityBone:       0,
				wingdrakeHide:     0,
			},
		},
	];

	public get currentCampaignDay() {
		const current = this.days[this.day.value - 1];
		if (!current)
			throw new Error('Invalid day.');

		return current;
	}

	constructor(public campaignId: string) { }

	public saveCampaign() {
		const data: Campaign = {
			campaignId:     this.campaignId,
			campaignLength: this.campaignLength,
			campaignName:   this.campaignName,
			hunterName:     this.hunterName,
			palicoName:     this.palicoName,
			playerName:     this.playerName,
			days:           this.days,
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
	}

	public loadCampaign() {
		const availableCampaigns = storageHandler.getItem<Campaign[]>('availableCampaigns', []);
		const campaign = availableCampaigns.find(c => c.campaignId === this.campaignId);
		if (!campaign)
			return console.error('no campaign found with id: ' + this.campaignId);

		this.days           = campaign.days;
		this.day.value      = campaign.days.length;
		this.playerName     = campaign.playerName;
		this.hunterName     = campaign.hunterName;
		this.palicoName     = campaign.palicoName;
		this.campaignName   = campaign.campaignName;
		this.campaignLength = campaign.campaignLength;
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
