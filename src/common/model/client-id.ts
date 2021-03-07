import { Coordinates } from '../shared/types'

export class ClientId {
    private id: number;

    constructor(id: number) {
        this.id = id;
    }

    static fromCoordinates(coords: Coordinates): ClientId {
        return new ClientId((coords.x << 16) | coords.y);
    }

    getCoordinates(): Coordinates {
        return {
            x: this.id >>> 16,
            y: this.id & 0b1111111111111111
        }
    }
}
