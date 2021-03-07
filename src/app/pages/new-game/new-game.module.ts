import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NbButtonModule, NbCardModule, NbLayoutModule} from '@nebular/theme';
import {NewGameComponent} from './new-game.component';
import {DialogModule} from '../../../common/dialogs/dialog.module';


@NgModule({
    declarations: [NewGameComponent],
    imports: [
        CommonModule,
        NbCardModule,
        NbButtonModule,
        NbLayoutModule,
        DialogModule,
    ],
    exports: [
        NewGameComponent
    ]
})
export class NewGameModule {
}
