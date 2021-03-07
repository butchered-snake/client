import {Component, OnInit} from '@angular/core';
import {AdminClientConnectionService} from '../../../common/services/admin-client-connection.service';
import {LogService} from '../../../common/services/log.service';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

    constructor(private logger: LogService, public adminClientConnectionService: AdminClientConnectionService) {
    }

    ngOnInit(): void {
    }

    public startGame(): void {
        this.logger.info('start game lol');
    }

}

