import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributebarComponent } from './attributebar.component';

describe('AttributebarComponent', () => {
  let component: AttributebarComponent;
  let fixture: ComponentFixture<AttributebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttributebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
