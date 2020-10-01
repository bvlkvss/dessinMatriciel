import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserGuideComponent } from './user-guide.component';

describe('UserGuideComponent', () => {
    let component: UserGuideComponent;
    let fixture: ComponentFixture<UserGuideComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UserGuideComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserGuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open Divers div when i call openTab with divers as argument', () => {
        component.openTab("Divers");
        let x = document.getElementById("Divers") as HTMLElement;
        expect(x.style.display).toEqual("block");
    });

    it('should open Outils div when i call openTab with Outils as argument', () => {
        component.openTab("Outils");
        let x = document.getElementById("Outils") as HTMLElement;
        expect(x.style.display).toEqual("block");
    });

    it('should set Background style to block when i call DisplayUserGuide', () => {
        UserGuideComponent.displayUserGuide();
        let x = document.getElementById("background") as HTMLElement;
        expect(x.style.display).toEqual("block");
    });

    it('should set Background style to none when i call CloseUserGuide', () => {
        component.closeUserGuide();
        let x = document.getElementById("background") as HTMLElement;
        expect(x.style.display).toEqual("none");
    });
});
