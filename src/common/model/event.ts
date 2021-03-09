import {EventType} from '../shared/event-type.enum';
import {Direction} from '../shared/direction.enum';
import {Position} from '../shared/types';

export class Event {
    constructor(public type: EventType) {
    }
}

// admin events
export class AdminEvent extends Event {
    constructor(type: EventType) {
        super(type);
    }
}

export class PlaceSnake extends AdminEvent {
    constructor() {
        super(EventType.PlaceSnake);
    }
}

export class StartGame extends AdminEvent {
    constructor() {
        super(EventType.StartGame);
    }
}

export class StopGame extends AdminEvent {
    constructor(public reason: string) {
        super(EventType.StopGame);
    }
}

export class SetFood extends AdminEvent {
    constructor() {
        super(EventType.SetFood);
    }
}

export class PlacedFood extends AdminEvent {
    constructor(public newPos: Position, public from: number) {
        super(EventType.PlacedFood);
    }
}

export class FoodPosUpdate extends AdminEvent {
    constructor(public newPos: Position, public from: number) {
        super(EventType.FoodPosUpdate);
    }
}

export class FoodEaten extends AdminEvent {
    constructor() {
        super(EventType.FoodEaten);
    }
}

export class Tick extends AdminEvent {
    constructor() {
        super(EventType.Tick);
    }
}

export class RequestOffer extends AdminEvent {
    constructor(public from: number, public fromName: string, public to: number) {
        super(EventType.RequestOffer);
    }
}

export class SetClientId extends AdminEvent {
    constructor(public id: number) {
        super(EventType.SetClientId);
    }
}

export class ProvideOffer extends AdminEvent {
    constructor(public from: number, public fromName: string, public to: number, public offer: string) {
        super(EventType.ProvideOffer);
    }
}

export class ProvideAnswer extends AdminEvent {
    constructor(public from: number, public to: number, public answer: string) {
        super(EventType.ProvideAnswer);
    }
}

export class ConnectionEstablished extends AdminEvent {
    constructor(public from: number, public to: number) {
        super(EventType.ConnectionEstablished);
    }
}

// neighbour events
export class NeighbourEvent extends Event {
    constructor(type: EventType, public direction: Direction) {
        super(type);
    }
}

export class HeadPosUpdate extends NeighbourEvent {
    constructor(direction: Direction, public newPos: Position) {
        super(EventType.HeadPosUpdate, direction);
    }
}

export class HeadEntering extends NeighbourEvent {
    constructor(direction: Direction, public oldPos: Position) {
        super(EventType.HeadEntering, direction);
    }
}

export class TailEntering extends NeighbourEvent {
    constructor(direction: Direction, public oldPos: Position) {
        super(EventType.TailEntering, direction);
    }
}

export class HeadPosLeavingContext extends NeighbourEvent {
    constructor(direction: Direction) {
        super(EventType.HeadPosLeavingContext, direction);
    }
}

