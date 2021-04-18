import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.sass']
})
export class SidemenuComponent implements OnInit {

  todayYear = new Date(Date.now()).getFullYear()
  
  constructor() { }

  ngOnInit(): void {
  }

}
