import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../../../common/services/player.service';

@Component({
  selector: 'app-wait-lobby',
  templateUrl: './wait-lobby.component.html',
  styleUrls: ['./wait-lobby.component.css']
})
export class WaitLobbyComponent implements OnInit {

  constructor(public playerService: PlayerService) {
  }

  ngOnInit(): void {
  }
}
