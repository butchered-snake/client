import {LogService} from '../services/log.service';
import {Event} from '../model/event';

export class Neighbour {
    private onEvent: (event: Event) => void;

    constructor(private logger: LogService, onEventCallback: (event: Event) => void) {
        this.onEvent = onEventCallback;
    }
}

