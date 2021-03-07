import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LobbyComponent} from './lobby.component';
import {NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule, NbSpinnerModule} from '@nebular/theme';
import {RouterModule} from '@angular/router';


@NgModule({
    declarations: [LobbyComponent],
    imports: [
        CommonModule,
        NbCardModule,
        NbLayoutModule,
        RouterModule,
        NbSpinnerModule,
        NbButtonModule,
        NbIconModule
    ]
})
export class LobbyModule {
}

