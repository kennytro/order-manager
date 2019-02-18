import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Client } from '../../../../../../shared/sdk/models';


@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  private _clients: Client[] = []; 

  constructor(private _route: ActivatedRoute) { }

  ngOnInit() {
    this._route.data.subscribe(routeData => {
      if (routeData['clients']) {
        this._clients = routeData['clients'];
      }
    })
  }

  getClientsCount() {
    return this._clients.length;
  }

  getClients() {
    return this._clients;
  }

  addClient() {
    console.log('clicked new client');
  }
}
