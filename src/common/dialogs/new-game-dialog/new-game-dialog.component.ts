import {Component, OnInit} from '@angular/core';
import {NbDialogRef} from '@nebular/theme';

@Component({
  selector: 'app-new-game-dialog',
  templateUrl: './new-game-dialog.component.html',
  styleUrls: ['./new-game-dialog.component.css']
})
export class NewGameDialogComponent implements OnInit {

  constructor(protected dialogReference: NbDialogRef<NewGameDialogComponent>) {
  }

  ngOnInit(): void {
  }

  public close(name: string): void {
    this.dialogReference.close(name);
  }

}
