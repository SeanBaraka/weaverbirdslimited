import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.sass']
})
export class PagerComponent implements OnInit {

  constructor() { }

  currentPage: 1

  ngOnInit(): void {
  }

  // Load the previous page items
  showPrevious() {
    this.currentPage --
  }

  // load the next page Items
  showNext() {
    this.currentPage ++
  }

}
