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


export class CampaignTracker {

	public days: CampaignDay[];
	public day: number;

	constructor(public campaignId: string) {
		const storedString = localStorage.getItem('campaign-' + campaignId);
		if (!storedString) {
			console.error('no campaign found with id: ' + campaignId);

			return;
		}

		const days = JSON.parse(storedString);
	}

}
