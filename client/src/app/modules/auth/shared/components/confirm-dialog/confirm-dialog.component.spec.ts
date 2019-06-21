import { Component, NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MatDialog, MatDialogModule } from '@angular/material';
import { AuthSharedModule } from '../../auth-shared.module';
import { ConfirmDialogComponent, DialogData } from './confirm-dialog.component';

// Noop component is only a workaround to trigger change detection
@Component({
  template: ''
})
class NoopComponent {}

const TEST_DIRECTIVES = [
  NoopComponent
];

@NgModule({
  imports: [MatDialogModule, NoopAnimationsModule, AuthSharedModule],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [
    ConfirmDialogComponent
  ],
})
class DialogTestModule { }


describe('ConfirmDialogComponent', () => {
  let dialog: MatDialog;
  let overlayContainerElement: HTMLElement;
  let noop: ComponentFixture<NoopComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ DialogTestModule ],
      providers: [
        { provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return { getContainerElement: () => overlayContainerElement };
        }}
      ]
    });

    dialog = TestBed.get(MatDialog);
    noop = TestBed.createComponent(NoopComponent);
  });

  it('should create', () => {
    const dialogData: DialogData = {
      title: 'Are you sure?'
    };
    dialog.open(ConfirmDialogComponent, { data: dialogData });
    noop.detectChanges(); // Updates the dialog in the overlay
    const h2 = overlayContainerElement.querySelector('#mat-dialog-title-0');
    expect(h2.textContent).toBe('Are you sure?');
  });
});
