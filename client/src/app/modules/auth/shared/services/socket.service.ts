import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import { BASE_URL } from '../../../../shared/base.url';

/**
 * Note: This service is not singleton, meaning component must provide it in
 * its decorator(See employee-layout.component.ts for example). The reason is to disconnect
 * socket when owning component is destroyed.
 */
@Injectable()
export class SocketService implements OnDestroy {
  private socket;
  constructor() { 
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  initSocket(ns: string) {
    let url = BASE_URL;
    if (ns) {
      url += '/' + ns;
    }
    this.socket = socketIo(url);
  }

  onModel(model:string) {
    return new Observable<any>(observer => {
      this.socket.on(model, (m) => observer.next(m));
    });
  }
}
