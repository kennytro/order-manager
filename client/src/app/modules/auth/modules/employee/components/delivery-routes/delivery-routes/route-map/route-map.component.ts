declare function require(path: string);
import { Component, OnInit, Input } from '@angular/core';
import { DataApiService } from '../../../../services/data-api.service';

interface marker {
  clientId: number,
  label: string,
  lat: number,
  lng: number,
  opacity: number
};

@Component({
  selector: 'app-route-map',
  templateUrl: './route-map.component.html',
  styleUrls: ['./route-map.component.css']
})
export class RouteMapComponent implements OnInit {
  homeIcon: any;
  private businessMarker: marker;
  markers: marker[] = [];
  private _deliveryRoute: any;
  @Input()
  set deliveryRoute(route: any) {
    if (!this._deliveryRoute || this._deliveryRoute.id !== route.id) {
      this._deliveryRoute = route;
      this._updateMap();
    }
  }
  get deliveryRoute(): any { return this._deliveryRoute; }

  constructor(private _dataApi: DataApiService) {
    this.homeIcon = {
      url: require('../../../../../../../../../assets/img/warehouse-solid.svg'),
      scaledSize: {
        height: 20,
        width: 20
      }
    };
    // TO DO: update with business address in 'settings' component
    this.businessMarker = {
      clientId: 0,
      label: 'ETR',
      lat: 34.0330063,
      lng: -118.2394139,
      opacity: 0.5
    };
  }

  ngOnInit() {
  }

  latitude(): number {
    return this.businessMarker.lat;  // use business location for initial value
  }

  longitude(): number {
    return this.businessMarker.lng;  // use business location for initial value
  }

  // max(coordType: 'lat' | 'lng'): number {
  //   return Math.max(...this.markers.map(marker => marker[coordType]));
  // }

  // min(coordType: 'lat' | 'lng'): number {
  //   return Math.min(...this.markers.map(marker => marker[coordType]));
  // }

  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }

  private _updateMap() {
    if (this._deliveryRoute) {
      this._dataApi.genericMethod('DeliveryRoute', 'getClientLocation', [this._deliveryRoute.id])
        .subscribe(list => {
          this.markers = list.filter(locInfo => locInfo.location).map(locInfo => {
            return {
              clientId: locInfo.id,
              label: locInfo.name,
              lat: locInfo.location.lat,
              lng: locInfo.location.lng,
              opacity: 1
            };
          });
        });
    }
  }
}
