import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FileService } from './file.service';
import { asyncData, asyncError } from '../../../../../testing/async-observable-helpers';

describe('FileService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);
    TestBed.configureTestingModule({
      providers: [
        FileService,
        { provide: HttpClient, useValue: httpSpy }
      ]
    });
    httpClientSpy = TestBed.get(HttpClient);    
  });

  it('should be created', () => {
    const service: FileService = TestBed.get(FileService);
    expect(service).toBeTruthy();
  });
  // TO DO: test 'downloadPDF()'
});
