import { Component } from '@angular/core';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { AttributeBarComponent } from '../attribute-bar/attributebar.component';

const FACES_STAMPS_LENGHT = 18;
const NATURE_STAMPS_LENGHT = 24;
const FLAGS_STAMPS_LENGHT = 14;
const CORONA_STAMPS_LENGHT = 17;
const APPS_STAMPS_LENGHT = 13;
const FOOD_STAMPS_LENGHT = 23;

@Component({
    selector: 'app-stamps-container',
    templateUrl: './stamps-container.component.html',
    styleUrls: ['./stamps-container.component.scss'],
})
export class StampsContainerComponent {
    stamps: Map<string, string[]>;
    constructor(private stampService: StampService) {
        this.stamps = new Map<string, string[]>([
            ['Visages', this.getImages('face', FACES_STAMPS_LENGHT)],
            ['Nature', this.getImages('nature', NATURE_STAMPS_LENGHT)],
            ['Animaux', this.getImages('animal', FLAGS_STAMPS_LENGHT)],
            ['Drapeaux', this.getImages('flag', FLAGS_STAMPS_LENGHT)],
            ['Corona', this.getImages('corona', CORONA_STAMPS_LENGHT)],
            ['Apps', this.getImages('internet', APPS_STAMPS_LENGHT)],
            ['Nourriture', this.getImages('food', FOOD_STAMPS_LENGHT)],
        ]);
    }
    // avoid pipe sorting
    noOrder(): number {
        return 0;
    }

    getImages(category: string, numberOfEmoji: number): string[] {
        const stamps: string[] = [];
        for (let i = 0; i < numberOfEmoji; i++) stamps.push('../../../assets/Stamps/' + category + i + '.png');
        return stamps;
    }

    setCurrentImage(imageName: string): void {
        this.stampService.image.src = '../../../assets/Stamps/' + imageName;
        AttributeBarComponent.showStamps = !AttributeBarComponent.showStamps;
        this.stampService.getStampObs().next();
    }
}
