import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddprovinceComponent } from './addprovince.component';

describe('AddprovinceComponent', () => {
  let component: AddprovinceComponent;
  let fixture: ComponentFixture<AddprovinceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddprovinceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddprovinceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
