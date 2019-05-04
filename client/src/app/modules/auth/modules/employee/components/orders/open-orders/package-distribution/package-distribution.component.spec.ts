import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageDistributionComponent } from './package-distribution.component';

describe('PackageDistributionComponent', () => {
  let component: PackageDistributionComponent;
  let fixture: ComponentFixture<PackageDistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PackageDistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageDistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
