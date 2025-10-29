import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantSelectionComponent } from './tenant-selection.component';

describe('TenantSelectionComponent', () => {
  let component: TenantSelectionComponent;
  let fixture: ComponentFixture<TenantSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantSelectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TenantSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
