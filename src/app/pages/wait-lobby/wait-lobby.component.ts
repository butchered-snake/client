import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-wait-lobby',
  templateUrl: './wait-lobby.component.html',
  styleUrls: ['./wait-lobby.component.css']
})
export class WaitLobbyComponent implements OnInit {

  public name: string = '';
  public code: string = '';

  constructor(private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.name = params.name;
      this.code = params.code;
    });
  }
}
