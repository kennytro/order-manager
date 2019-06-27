import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ProductService } from './product.service';
import { asyncData, asyncError } from '../../../../../../testing/async-observable-helpers';

describe('ProductService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: HttpClient, useValue: httpSpy }
      ]
    });
    httpClientSpy = TestBed.get(HttpClient); 
  });

  it('should be created', () => {
    const service: ProductService = TestBed.get(ProductService);
    expect(service).toBeTruthy();
  });
  it('should get image', () => {
    const blob = new Blob(['TEST']);
    httpClientSpy.get.and.returnValue(asyncData(blob));
    const service: ProductService = TestBed.get(ProductService);
    expect(service.getImage(undefined)).toEqual(undefined, 'returned undefined without URL');
    service.getImage('test.com/test').subscribe(
      image => expect(image).toEqual(blob, 'returned image'),
      fail
    );
    expect(httpClientSpy.get.calls.count()).toBe(1, 'Called HTTP client get()');
  })
  // TO DO: test getNoPictureImage(), putImageToS3()
});
