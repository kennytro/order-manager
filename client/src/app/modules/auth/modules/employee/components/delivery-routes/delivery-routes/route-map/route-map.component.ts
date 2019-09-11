declare function require(path: string);
import { Component, OnInit, Input } from '@angular/core';
import { take } from 'rxjs/operators';
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
  businessMarker: marker;
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
  }

  ngOnInit() {
    // Initialize business marker using company information.
    this._dataApi.genericMethod('CompanyInfo', 'getCompanyInfo')
      .pipe(take(1))
      .subscribe(result => {
        if (result.locationLat && result.locationLng) {
          this.businessMarker = {
            clientId: 0,
            label: result.name,
            lat: Number(result.locationLat),
            lng: Number(result.locationLng),
            opacity: 0.5
          };
        } else {
          console.warn('Company information lacks geocodes.');
        }
      });
  }

  latitude(): number {
    return this.businessMarker ? this.businessMarker.lat : 0;  // use business location for initial value
  }

  longitude(): number {
    return this.businessMarker ? this.businessMarker.lng : 0;  // use business location for initial value
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
