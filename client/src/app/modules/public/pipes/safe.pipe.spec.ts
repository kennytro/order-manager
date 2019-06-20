import { SafePipe } from './safe.pipe';

describe('SafePipe', () => {
  it('create an instance', () => {
    // create 'bypassSecurityTrustHtml' spy on an object representing DomSanitizer
    const domSanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustHtml']);
    const pipe = new SafePipe(domSanitizerSpy);
    expect(pipe).toBeTruthy();
  });
});
