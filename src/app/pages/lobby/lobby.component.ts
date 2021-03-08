import {Component, OnInit} from '@angular/core';
import {AdminClientConnectionService} from '../../../common/services/admin-client-connection.service';
import {LogService} from '../../../common/services/log.service';
import {AdminClientService} from '../../../common/services/admin-client.service';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

    constructor(private logger: LogService, public adminClientConnectionService: AdminClientConnectionService,
                private adminClientService: AdminClientService, private clipboard: Clipboard) {
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
