import {Component, OnInit} from '@angular/core';
import {NbDialogService} from '@nebular/theme';
import {NewGameDialogComponent} from '../../../common/dialogs/new-game-dialog/new-game-dialog.component';


@Component({
  selector: 'app-new-game',
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.css']
})
export class NewGameComponent implements OnInit {

  constructor(private dialogService: NbDialogService) {
  }

  ngOnInit(): void {
  }

  public openNewGameDialog() {
    this.dialogService.open(NewGameDialogComponent, {}).onClose.subscribe(value => {
      console.log(value);
    });
  }

}
