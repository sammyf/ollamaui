import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryDetailsComponent } from './memory-details.component';

describe('MemoryDetailsComponent', () => {
  let component: MemoryDetailsComponent;
  let fixture: ComponentFixture<MemoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemoryDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
