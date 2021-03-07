import {Injectable} from '@angular/core';
import {LogService} from './log.service';

@Injectable({
    providedIn: 'root'
})
export class NeighbourService {

    constructor(private logger: LogService) {
    }
}

