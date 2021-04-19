import {Component} from '@angular/core';
import {RoutingService} from '../common/services/routing.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    constructor(private routingService: RoutingService) {
    }
}

