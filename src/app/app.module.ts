import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NbDialogModule, NbThemeModule, NbToastrModule} from '@nebular/theme';
import {NbEvaIconsModule} from '@nebular/eva-icons';
import {AppRoutingModule} from './app-routing.module';
import {NewGameModule} from './pages/new-game/new-game.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {LobbyModule} from './pages/lobby/lobby.module';
import {WaitLobbyModule} from './pages/wait-lobby/wait-lobby.module';
import {GameModule} from './pages/game/game.module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NbThemeModule.forRoot({name: 'dark'}),
        NbDialogModule.forRoot(),
        NbEvaIconsModule,
        AppRoutingModule,
        NewGameModule,
        NbToastrModule.forRoot({}),
        LobbyModule,
        WaitLobbyModule,
        GameModule,
        NgbModule,
        FontAwesomeModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
