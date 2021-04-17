import {Component, OnInit} from '@angular/core';
import {AdminClientConnectionService} from '../../../common/services/admin-client-connection.service';
import {LogService} from '../../../common/services/log.service';
import {AdminClientService} from '../../../common/services/admin-client.service';
import {Clipboard} from '@angular/cdk/clipboard';
import {ClientConnectionService} from '../../../common/services/client-connection.service';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

    constructor(private logger: LogService, public adminClientConnectionService: AdminClientConnectionService,
                private adminClientService: AdminClientService, private clipboard: Clipboard,
                private clientConnectionService: ClientConnectionService) {
        adminClientConnectionService.createdGame.subscribe(value => {
            this.clientConnectionService.code = value;
            this.clientConnectionService.name = this.adminClientConnectionService.name;
            this.clientConnectionService.joinGame();
        });
    }

    ngOnInit(): void {
    }

    public saveToClipboard(): void {
        this.clipboard.copy(this.adminClientConnectionService.code);
    }

    public startGame(): void {
        this.adminClientService.addConnections();
    }
}
