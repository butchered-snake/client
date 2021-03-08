import {Position} from '../shared/types';

export class ClientId {
    public id: number;

    constructor(id: number) {
        this.id = id;
    }

    static fromCoordinates(coords: Position): ClientId {
        return new ClientId((coords.x << 16) | coords.y);
    }

    getCoordinates(): Position {
        return {
            x: this.id >>> 16,
            y: this.id & 0b1111111111111111
        };
    }
}

