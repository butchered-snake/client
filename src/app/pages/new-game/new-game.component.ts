import {Component, OnInit} from '@angular/core';
import {NbDialogService} from '@nebular/theme';
import {NewGameDialogComponent} from '../../../common/dialogs/new-game-dialog/new-game-dialog.component';
import {Router} from '@angular/router';
import {JoinGameDialogComponent} from '../../../common/dialogs/join-game-dialog/join-game-dialog.component';
import {AdminClientConnectionService} from '../../../common/services/admin-client-connection.service';
import {ClientConnectionService} from '../../../common/services/client-connection.service';


@Component({
  selector: 'app-new-game',
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.css']
})
export class NewGameComponent implements OnInit {

  constructor(private dialogService: NbDialogService, private router: Router,
              private adminClientConnectionService: AdminClientConnectionService,
              private clientConnectionService: ClientConnectionService) {
  }

  ngOnInit(): void {
  }

  public openNewGameDialog() {
    this.dialogService.open(NewGameDialogComponent, {}).onClose.subscribe(name => {
      console.log(name);
      this.router.navigate(['/lobby'], {
        queryParams: {
          name: name,
        }
      }).then(value => {
        this.adminClientConnectionService.name = name;
        this.adminClientConnectionService.requestNewGame();
      });
    });
  }

  public openJoinGameDialog() {
    this.dialogService.open(JoinGameDialogComponent, {}).onClose.subscribe(args => {
      this.router.navigate(['/wait-lobby'], {}).then(value => {
        this.clientConnectionService.name = args.name;
        this.clientConnectionService.code = args.code;
        this.clientConnectionService.joinGame();
        console.log('Join game');
      });
    });
  }

}
