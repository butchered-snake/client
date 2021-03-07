import {Component, OnInit} from '@angular/core';
import {NbDialogRef} from '@nebular/theme';

@Component({
    selector: 'app-join-game-dialog',
    templateUrl: './join-game-dialog.component.html',
    styleUrls: ['./join-game-dialog.component.css']
})
export class JoinGameDialogComponent implements OnInit {

    constructor(protected dialogReference: NbDialogRef<JoinGameDialogComponent>) {
    }

    ngOnInit(): void {
    }

    public close(name: string, code: string): void {
        this.dialogReference.close({
            name: name,
            code: code
        });
    }

}
