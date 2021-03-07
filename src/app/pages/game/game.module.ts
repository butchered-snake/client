import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GameComponent} from './game.component';
import {RouterModule} from '@angular/router';
import {NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule} from '@nebular/theme';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';


@NgModule({
    declarations: [GameComponent],
    imports: [
        CommonModule,
        RouterModule,
        NbLayoutModule,
        NbCardModule,
        NbIconModule,
        NbButtonModule,
        FontAwesomeModule
    ]
})
export class GameModule {
}
