import {Component, OnInit} from '@angular/core';
import {NbDialogService} from '@nebular/theme';
import {NewGameDialogComponent} from '../../../common/dialogs/new-game-dialog/new-game-dialog.component';
import {Router} from '@angular/router';


@Component({
  selector: 'app-new-game',
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.css']
})
export class NewGameComponent implements OnInit {

  constructor(private dialogService: NbDialogService, private router: Router) {
  }

  ngOnInit(): void {
  }

  public openNewGameDialog() {
    this.dialogService.open(NewGameDialogComponent, {}).onClose.subscribe(name => {
      console.log(name);
      this.router.navigate(['/lobby'], {
        queryParams: {
          name: name
        }
      }).then(value => console.log('Create new game'));
    });
  }

}
