import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LobbyComponent} from './lobby.component';
import {NbCardModule, NbLayoutModule} from '@nebular/theme';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [LobbyComponent],
  imports: [
    CommonModule,
    NbCardModule,
    NbLayoutModule,
    RouterModule
  ]
})
export class LobbyModule {
}
