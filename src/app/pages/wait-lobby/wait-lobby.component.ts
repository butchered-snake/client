import {Component, OnInit} from '@angular/core';
import {ClientConnectionService} from '../../../common/services/client-connection.service';

@Component({
    selector: 'app-wait-lobby',
    templateUrl: './wait-lobby.component.html',
    styleUrls: ['./wait-lobby.component.css']
})
export class WaitLobbyComponent implements OnInit {

    constructor(public clientConnectionService: ClientConnectionService) {
    }

    ngOnInit(): void {
    }
}

