import {NgModule} from '@angular/core';

import {RouterModule, Routes} from '@angular/router';
import {NewGameComponent} from './pages/new-game/new-game.component';
import {LobbyComponent} from './pages/lobby/lobby.component';
import {WaitLobbyComponent} from './pages/wait-lobby/wait-lobby.component';
import {GameComponent} from './pages/game/game.component';

const routes: Routes = [
    {path: '', redirectTo: 'new-game', pathMatch: 'full'},
    {path: 'new-game', component: NewGameComponent},
    {path: 'lobby', component: LobbyComponent},
    {path: 'wait-lobby', component: WaitLobbyComponent},
    {path: 'game', component: GameComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {
}

