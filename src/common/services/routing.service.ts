import {Injectable} from '@angular/core';
import {filter} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';
import {AdminClientConnectionService} from './admin-client-connection.service';
import {BackendSocketService} from './backend-socket.service';

@Injectable({
    providedIn: 'root'
})
export class RoutingService {

    private previousRoute: string = '/new-game';

    constructor(private router: Router, private adminClientConnectionService: AdminClientConnectionService, private backendSocketService: BackendSocketService) {
        router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        ).subscribe(value => {
            console.log(`previous: ${this.previousRoute}. New: ${value.url}`);
            if (value.url === '/new-game' && this.previousRoute !== '/new-game') {
                this.checkForLingeringGame();
                window.location.reload();
            }
            this.previousRoute = value.url;

        });
    }

    private checkForLingeringGame(): void {
        if (this.adminClientConnectionService.code !== '') {
            this.backendSocketService.deleteGame(this.adminClientConnectionService.code);
        }
    }
}
