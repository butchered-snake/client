import {Component, OnInit} from '@angular/core';
import {NbDialogService} from '@nebular/theme';
import {NewGameDialogComponent} from '../../../common/dialogs/new-game-dialog/new-game-dialog.component';
import {Router} from '@angular/router';
import {JoinGameDialogComponent} from '../../../common/dialogs/join-game-dialog/join-game-dialog.component';
import {AdminClientConnectionService} from '../../../common/services/admin-client-connection.service';
import {ClientConnectionService} from '../../../common/services/client-connection.service';
import {LogService} from '../../../common/services/log.service';
import {LocalRTCClient} from '../../../common/model/local-rtc-client';
import {RemoteRTCClient} from '../../../common/model/remote-rtc-client';

@Component({
    selector: 'app-new-game',
    templateUrl: './new-game.component.html',
    styleUrls: ['./new-game.component.css']
})
export class NewGameComponent implements OnInit {

    constructor(private logger: LogService,
                private dialogService: NbDialogService, private router: Router,
                private adminClientConnectionService: AdminClientConnectionService,
                private clientConnectionService: ClientConnectionService) {
    }

    ngOnInit(): void {
    }

    public openNewGameDialog() {
        this.dialogService.open(NewGameDialogComponent, {}).onClose.subscribe(name => {
            this.logger.debug(`game name: ${name}`);
            this.router.navigate(['/lobby'], {}).then(value => {
                this.adminClientConnectionService.name = name;
                this.adminClientConnectionService.requestNewGame();
                this.createOwnConnection();
            });
        });

    }

    public openJoinGameDialog() {
        this.dialogService.open(JoinGameDialogComponent, {}).onClose.subscribe(args => {
            this.router.navigate(['/wait-lobby'], {}).then(value => {
                this.clientConnectionService.name = args.name;
                this.clientConnectionService.code = args.code;
                this.clientConnectionService.joinGame();
                this.logger.info('join game');
            });
        });
    }

    private createOwnConnection(): void {
        const local = new LocalRTCClient(this.logger);
        const remote = new RemoteRTCClient(this.logger);
        let gotOffer = false;
        let gotAnswer = false;

        local.newIceCandidate.subscribe(offer => {
            if (gotOffer) {
                return;
            }
            remote.setOffer(offer).then(event => {
                remote.createNewAnswer();
            });
            gotOffer = true;
        });

        remote.newIceCandidate.subscribe(answer => {
            if (gotAnswer) {
                return;
            }
            local.setAnswer(answer);
            gotAnswer = true;
        });
        local.createNewOffer();

        this.adminClientConnectionService.addPeerConnection(local);
        this.clientConnectionService.setPeerConnection(remote);
    }

}
