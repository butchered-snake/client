import {Injectable} from '@angular/core';
import {LogService} from './log.service';

@Injectable({
    providedIn: 'root'
})
export class AdminClientService {

    constructor(private logger: LogService) {
    }
}


