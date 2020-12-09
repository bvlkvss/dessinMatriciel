import { Component } from '@angular/core';
import { Const } from '@app/classes/constants';
import { AttributeBarComponent } from '@app/components/attribute-bar/attribute-bar.component';
import { StampService } from '@app/services/tools/stamp/stamp.service';

@Component({
    selector: 'app-stamps-container',
    templateUrl: './stamps-container.component.html',
    styleUrls: ['./stamps-container.component.scss'],
})
export class StampsContainerComponent {
    stamps: Map<string, string[]>;
    constructor(private stampService: StampService) {
        this.stamps = new Map<string, string[]>([
            ['Visages', this.getImages('face', Const.FACES_STAMPS_LENGHT)],
            ['Nature', this.getImages('nature', Const.NATURE_STAMPS_LENGHT)],
            ['Animaux', this.getImages('animal', Const.FLAGS_STAMPS_LENGHT)],
            ['Drapeaux', this.getImages('flag', Const.FLAGS_STAMPS_LENGHT)],
            ['Corona', this.getImages('corona', Const.CORONA_STAMPS_LENGHT)],
            ['Apps', this.getImages('internet', Const.APPS_STAMPS_LENGHT)],
            ['Nourriture', this.getImages('food', Const.FOOD_STAMPS_LENGHT)],
        ]);
    }
    // avoid pipe sorting, see html file
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
