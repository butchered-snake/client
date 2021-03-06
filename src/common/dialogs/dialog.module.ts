import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NewGameDialogComponent} from './new-game-dialog/new-game-dialog.component';
import {NbButtonModule, NbCardModule, NbInputModule} from '@nebular/theme';


@NgModule({
  declarations: [NewGameDialogComponent],
  imports: [
    CommonModule,
    NbCardModule,
    NbInputModule,
    NbButtonModule
  ],
  exports: [
    NewGameDialogComponent
  ]
})
export class DialogModule {
}
