import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassComponent } from './pass.component';

describe('PassComponent', () => {
  let component: PassComponent;
  let fixture: ComponentFixture<PassComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PassComponent]
    });
    fixture = TestBed.createComponent(PassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
