import { TestBed } from '@angular/core/testing';
import swal from 'sweetalert2';
import { AlertService } from './alert.service';

describe('AlertService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [ AlertService ]
  }));

  it('should be created', () => {
    const service: AlertService = TestBed.get(AlertService);
    expect(service).toBeTruthy();
  });
  // TO DO: test alertSuccess() & confirm()
});
