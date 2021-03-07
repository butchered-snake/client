import {Injectable} from '@angular/core';
import {LogService} from './log.service';
import {Event, HeadPosUpdate, FoodPosUpdate} from '../model/event';
import {EventType} from '../shared/event-type.enum';
import {ClientId} from '../model/client-id';
import {Neighbour} from '../model/neighbour';
import {Direction} from '../shared/direction.enum';
import {BoardService} from './board.service';

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private id: ClientId;
    private neighbours: Map<Direction, Neighbour>;

    constructor(private logger: LogService, private board: BoardService) {
        this.id = new ClientId(0);
        this.neighbours = new Map();
        this.board.setEventCallback(this.processBoardEvent);
    }

    addNeighbour(neighbourId: ClientId) {
        this.neighbours.set(this.getNeighbourDirection(neighbourId), new Neighbour(this.logger, this.processNeighbourEvent));
    }

    processNeighbourEvent(event: Event) {
        switch(event.type) {
            case EventType.HeadPosUpdate:
                this.board.headIndicator = (event as HeadPosUpdate).newPos;
        }
    }

    processBoardEvent(event: Event) {
        
    }

    getNeighbourDirection(neighbourId: ClientId): Direction {
        const coords = this.id.getCoordinates();
        const neighbourCoords = neighbourId.getCoordinates();
        if (coords.x < neighbourCoords.x) {
            return Direction.East;
        } else if (coords.x > neighbourCoords.x) {
            return Direction.West;
        }
        if (coords.y < neighbourCoords.y) {
            return Direction.South;
        } else if (coords.y > neighbourCoords.y) {
            return Direction.North;
        }
        this.logger.error("neighbour should not have same pos as client");
        return Direction.NorthEast;
    }
}

