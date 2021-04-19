import {Injectable} from '@angular/core';
import {filter} from 'rxjs/operators';
import {NavigationEnd, Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class RoutingService {

    private previousRoute: string = '/new-game';

    constructor(private router: Router) {
        router.events.pipe(
            filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        ).subscribe(value => {
            console.log(`previous: ${this.previousRoute}. New: ${value.url}`);
            if (value.url === '/new-game' && this.previousRoute !== '/new-game') {
                window.location.reload();
            }
            this.previousRoute = value.url;

        });
    }
}
