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
	playerName: string;
	campaignName: string;
	hunterName: string;
	palicoName: string;
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
	days: CampaignDay[];
}


export class CampaignTracker implements Campaign {

	public days: CampaignDay[];
	public day: number;
	public playerName: string;
	public campaignName: string;
	public hunterName: string;
	public palicoName: string;

	constructor(public campaignId: string) {
		const availableCampaigns = storageHandler.getItem<Campaign[]>('availableCampaigns', []);
		const campaign = availableCampaigns.find(c => c.campaignId === campaignId);
		if (!campaign) {
			console.error('no campaign found with id: ' + campaignId);

			return;
		}

		this.days = campaign.days;
		this.day = campaign.days.length - 1;
		this.campaignName = campaign.campaignName;
		this.playerName = campaign.playerName;
		this.hunterName = campaign.hunterName;
		this.palicoName = campaign.palicoName;
	}

}
