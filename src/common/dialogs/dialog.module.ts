import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NewGameDialogComponent} from './new-game-dialog/new-game-dialog.component';
import {NbButtonModule, NbCardModule, NbInputModule} from '@nebular/theme';
import {JoinGameDialogComponent} from './join-game-dialog/join-game-dialog.component';
import { GameStoppedDialogComponent } from './game-stopped-dialog/game-stopped-dialog.component';


@NgModule({
    declarations: [NewGameDialogComponent, JoinGameDialogComponent, GameStoppedDialogComponent],
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

