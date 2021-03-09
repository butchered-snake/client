import {Component, OnInit} from '@angular/core';
import {NbDialogRef} from '@nebular/theme';

@Component({
    selector: 'app-game-stopped-dialog',
    templateUrl: './game-stopped-dialog.component.html',
    styleUrls: ['./game-stopped-dialog.component.css']
})
export class GameStoppedDialogComponent implements OnInit {

    constructor(protected dialogReference: NbDialogRef<GameStoppedDialogComponent>) {
    }

    ngOnInit(): void {
    }

    public close(): void {
        this.dialogReference.close();
    }

}
