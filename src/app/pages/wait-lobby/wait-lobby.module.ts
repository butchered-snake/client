import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WaitLobbyComponent} from './wait-lobby.component';
import {NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule, NbSpinnerModule} from '@nebular/theme';
import {RouterModule} from '@angular/router';


@NgModule({
    declarations: [WaitLobbyComponent],
    imports: [
        CommonModule,
        NbLayoutModule,
        RouterModule,
        NbButtonModule,
        NbIconModule,
        NbSpinnerModule,
        NbCardModule
    ]
})
export class WaitLobbyModule {
}

