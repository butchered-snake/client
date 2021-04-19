import {Injectable} from '@angular/core';
import {filter} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';
import {AdminClientConnectionService} from './admin-client-connection.service';
import {BackendSocketService} from './backend-socket.service';
import {AdminClientService} from './admin-client.service';
import {StopGame} from '../model/event';

@Injectable({
    providedIn: 'root'
})
export class RoutingService {

    private previousRoute: string = '/new-game';

    constructor(private router: Router, private adminClientConnectionService: AdminClientConnectionService,
                private backendSocketService: BackendSocketService, private adminClientService: AdminClientService) {
        router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        ).subscribe(value => {
            console.log(`previous: ${this.previousRoute}. New: ${value.url}`);
            if (value.url === '/new-game' && this.previousRoute !== '/new-game') {
                this.checkForLingeringGame();
                this.informClients();
                window.location.reload();
            }
            this.previousRoute = value.url;

        });
    }

    private informClients(): void {
        this.adminClientService.sendEventToClients(new StopGame('Game lobby left'));
    }

    private checkForLingeringGame(): void {
        if (this.adminClientConnectionService.code !== '') {
            this.backendSocketService.deleteGame(this.adminClientConnectionService.code);
        }
    }
}
