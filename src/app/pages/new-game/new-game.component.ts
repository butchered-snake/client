import {Component, OnInit} from '@angular/core';
import {NbDialogService} from '@nebular/theme';
import {NewGameDialogComponent} from '../../../common/dialogs/new-game-dialog/new-game-dialog.component';
import {Router} from '@angular/router';
import {BackendSocketService} from '../../../common/services/backend-socket.service';
import {JoinGameDialogComponent} from '../../../common/dialogs/join-game-dialog/join-game-dialog.component';
import {PlayerService} from '../../../common/services/player.service';


@Component({
  selector: 'app-new-game',
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.css']
})
export class NewGameComponent implements OnInit {

  constructor(private dialogService: NbDialogService, private router: Router, public socket: BackendSocketService,
              private playerService: PlayerService) {
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
        this.playerService.name = name;
        this.playerService.isAdmin = false;
        console.log('Create new game');
      });
    });
  }

  public openJoinGameDialog() {
    this.dialogService.open(JoinGameDialogComponent, {}).onClose.subscribe(args => {
      this.router.navigate(['/wait-lobby'], {}).then(value => {
        this.playerService.name = args.name;
        this.playerService.code = args.code;
        this.playerService.isAdmin = false;
        console.log('Join game');
      });
    });
  }

}
