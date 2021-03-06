import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NbDialogModule, NbThemeModule} from '@nebular/theme';
import {NbEvaIconsModule} from '@nebular/eva-icons';
import {AppRoutingModule} from './app-routing.module';
import {NewGameModule} from './pages/new-game/new-game.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LobbyModule} from './pages/lobby/lobby.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({name: 'corporate'}),
    NbDialogModule.forRoot(),
    NbEvaIconsModule,
    AppRoutingModule,
    NewGameModule,
    LobbyModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
