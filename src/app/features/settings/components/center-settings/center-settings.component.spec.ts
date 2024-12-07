import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterSettingsComponent } from './center-settings.component';

describe('CenterSettingsComponent', () => {
  let component: CenterSettingsComponent;
  let fixture: ComponentFixture<CenterSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CenterSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CenterSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
