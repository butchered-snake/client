import {NgModule} from '@angular/core';

import {RouterModule, Routes} from '@angular/router';
import {NewGameComponent} from './pages/new-game/new-game.component';

const routes: Routes = [
  {path: '', redirectTo: 'new-game', pathMatch: 'full'},
  {path: 'new-game', component: NewGameComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
