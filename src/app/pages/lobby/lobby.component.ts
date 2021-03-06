import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../../../common/services/player.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  constructor(public playerService: PlayerService) {
  }

  ngOnInit(): void {
  }

}
