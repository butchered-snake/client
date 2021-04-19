import {Component, NgZone, OnDestroy} from '@angular/core';
import {ClientConnectionService} from '../../../common/services/client-connection.service';
import {Router} from '@angular/router';
import {LogService} from '../../../common/services/log.service';
import {Subscription} from 'rxjs';
import {ClientService} from '../../../common/services/client.service';

@Component({
    selector: 'app-wait-lobby',
    templateUrl: './wait-lobby.component.html',
    styleUrls: ['./wait-lobby.component.css']
})
export class WaitLobbyComponent implements OnDestroy {

    public shouldLoad = true;
    private gameStartedSubscription: Subscription;
    private gameCanceledSubscription: Subscription;

    constructor(public clientConnectionService: ClientConnectionService, private clientService: ClientService, private router: Router, private logger: LogService, private ngZone: NgZone) {
        this.gameCanceledSubscription = this.clientService.gameCancled.subscribe(() => {
            this.shouldLoad = false;
        });
        this.gameStartedSubscription = this.clientService.gameStarted.subscribe(() => {
            this.ngZone.run(() => {
                this.router.navigate(['/game'], {}).then(value => this.logger.info('navigated to game'));
            });
        });
    }

    ngOnDestroy(): void {
        this.gameStartedSubscription.unsubscribe();
        this.gameCanceledSubscription.unsubscribe();
    }
}

