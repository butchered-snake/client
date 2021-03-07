import {Injectable} from '@angular/core';
import {LogService} from './log.service';

@Injectable({
    providedIn: 'root'
})
export class ClientService {

    constructor(private logger: LogService) {
    }
}

