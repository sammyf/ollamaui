import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernamePopupComponent } from './username-popup.component';

describe('UsernamePopupComponent', () => {
  let component: UsernamePopupComponent;
  let fixture: ComponentFixture<UsernamePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsernamePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsernamePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
