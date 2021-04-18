import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { SuperuserSetupComponent } from '../superuser-setup/superuser-setup.component';

@Component({
  selector: 'app-config-settings',
  templateUrl: './config-settings.component.html',
  styleUrls: ['./config-settings.component.sass']
})
export class ConfigSettingsComponent implements OnInit {

  constructor(private dialog: MatDialog) { }

  // the server url
  serverUrl = environment.apiBaseUrl

  // network status of the appllication
  connectionStatus = navigator.onLine ? 'online' : 'offline'

  // we use this method over here to launch a modal, that houses the registration component
  addUserDialog(): void {
    this.dialog.open(SuperuserSetupComponent, {
      width: '100%'
    })
  }

  

  ngOnInit(): void {
  }

}
