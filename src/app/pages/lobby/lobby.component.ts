import {Component, OnInit} from '@angular/core';
import {AdminClientConnectionService} from '../../../common/services/admin-client-connection.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-lobby',
    templateUrl: './lobby.component.html',
    styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

    constructor(public adminClientConnectionService: AdminClientConnectionService, private router: Router) {
    }

    ngOnInit(): void {
    }

    public startGame(): void {
        console.log('start game lol');
        this.router.navigate(['/game'], {}).then(value => console.log('navigated to game'));
    }

}

