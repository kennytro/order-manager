declare function require(path: string);
import { Component, OnInit } from '@angular/core';

import { ClientResolver } from '../../../services/client.resolver';

interface marker {
  label: string,
  lat: number,
  lng: number,
  opacity: number
};

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  openedWindow: number;
  homeIcon: any;
  companyMarker: marker;
  clientMarkers: marker[] = [];
  constructor(private _clientSvc: ClientResolver) {
    this.openedWindow = -1;
    this.homeIcon = {
      url: require('../../../../../../assets/img/warehouse-solid.svg'),
      scaledSize: {
        height: 20,
        width: 20
      }
    };
  }

  ngOnInit() {
    this._clientSvc.getLocations()
      .subscribe(result => {
        if (result) {
          if (result.company) {
            this.companyMarker = {
              label: result.company.name,
              lat: result.company.lat,
              lng: result.company.lng,
              opacity: 1
            };
          } else {
            console.warn('Company location is missing');
          }
          this.clientMarkers = result.clients.map(client => {
            return {
              label: client.name,
              lat: client.lat,
              lng: client.lng,
              opacity: 0.5
            };
          })
        }
      });
  }

  latitude(): number {
    return this.companyMarker ? this.companyMarker.lat : 0;
  }

  longitude(): number {
    return this.companyMarker ? this.companyMarker.lng : 0;
  }

  openInfoWindow(index: number) {
    this.openedWindow = index;
  }

  isInfoWindowOpen(index: number) {
    return this.openedWindow == index;
  }

  mouseOver(m: marker, i: number) {
    m.opacity = 1;
    this.openInfoWindow(i);
  }

  mouseOut(m: marker, i: number) {
    m.opacity = 0.5;
    this.openInfoWindow(-1);
  }

}
