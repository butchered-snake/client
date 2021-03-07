import {Component, OnInit} from '@angular/core';
import {AdminClientConnectionService} from '../../../common/services/admin-client-connection.service';
import {Router} from '@angular/router';
import {LogService} from '../../../common/services/log.service';
import {AdminClientService} from '../../../common/services/admin-client.service';


@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

    constructor(private logger: LogService, public adminClientConnectionService: AdminClientConnectionService, private router: Router,
                private adminClientService: AdminClientService) {
    }

    ngOnInit(): void {
    }

    public startGame(): void {
        this.router.navigate(['/game'], {}).then(value => this.logger.info('navigated to game'));
        this.adminClientService.addConnections();
    }
}
