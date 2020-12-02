import { Component } from '@angular/core';
import { StampService } from '@app/services/tools/stamp/stamp.service';

@Component({
  selector: 'app-stamps-container',
  templateUrl: './stamps-container.component.html',
  styleUrls: ['./stamps-container.component.scss'],
})
export class StampsContainerComponent {
  stamps: Map<string, string[]>;
  constructor(private stampService: StampService) {
    this.stamps =
      new Map<string, string[]>([
        ['Visages', this.getImages('face', 18)],
        ['Nature', this.getImages('nature', 24)],
        ['Animaux', this.getImages('animal', 14)],
        ['Drapeaux', this.getImages('flag', 14)],
        ['Corona', this.getImages('corona', 17)],
        ['Apps', this.getImages('internet', 13)],
        ['Nourriture', this.getImages('food', 23)]
      ]);
  }
  // avoid pipe sorting
  noOrder() {
    return 0;
  }

  getImages(category: string, numberOfEmoji: number): string[] {
    const stamps: string[] = [];
    for (let i = 0; i < numberOfEmoji; i++) stamps.push('../../../assets/Stamps/' + category + i + '.png');
    return stamps;
  }

  setCurrentImage(imageName: string): void {
    this.stampService.image.src = '../../../assets/Stamps/' + imageName;
    this.stampService.getStampObs().next();
  }

  ngOnInit(): void { }
}
