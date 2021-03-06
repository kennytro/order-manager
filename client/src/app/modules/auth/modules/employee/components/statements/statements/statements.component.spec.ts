import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlus, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';

import { AuthSharedModule } from '../../../../../shared/auth-shared.module';

import { StatementsComponent } from './statements.component';

import { FileService } from '../../../../../shared/services/file.service';
import { DataApiService } from '../../../services/data-api.service';

describe('StatementsComponent', () => {
  let component: StatementsComponent;
  let fixture: ComponentFixture<StatementsComponent>;
  let apiSpy: jasmine.SpyObj<DataApiService>;
  library.add(faPlus, faFilePdf);

  beforeEach(async(() => {
    const testStatements = [
      { id: '11100', client: {id: '111', name: 'testClient'}, statementDate: '1/1/2019', totalAmount: '100.00', note: ''}
    ];
    const route = ({ data: of({ statements: testStatements} ), snapshot: {} } as any) as ActivatedRoute;
    const dataSpy = jasmine.createSpyObj('DataApiService', ['genericMethod']);
    const fsSpy = jasmine.createSpyObj('FileService', ['downloadPDF']);

    TestBed.configureTestingModule({
      declarations: [ StatementsComponent ],
      imports: [ NoopAnimationsModule, AuthSharedModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: FileService, useValue: fsSpy },
        { provide: DataApiService, useValue: dataSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementsComponent);
    component = fixture.componentInstance;
    apiSpy = TestBed.get(DataApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});