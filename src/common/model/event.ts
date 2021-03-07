import {EventType} from '../shared/event-type.enum';
import {Direction} from '../shared/direction.enum';
import {Position} from '../shared/types';

export class Event {
    constructor(public type: EventType) {}

    static New(type: EventType, ...args: any[]): Event {
        switch(type) {
            case EventType.RequestOffer:
                return new (RequestOffer as EventConstructor<RequestOffer>)(...args);
            case EventType.SetClientId:
                return new (SetClientId as EventConstructor<SetClientId>)(...args);
            case EventType.ProvideOffer:
                return new (ProvideOffer as EventConstructor<ProvideOffer>)(...args);
            case EventType.ProvideAnswer:
                return new (ProvideAnswer as EventConstructor<ProvideAnswer>)(...args);
            case EventType.FoodPosUpdate:
                return new (FoodPosUpdate as EventConstructor<FoodPosUpdate>)(...args);
            case EventType.HeadPosUpdate:
                return new (HeadPosUpdate as EventConstructor<HeadPosUpdate>)(...args);
            default:
                console.error("grosse unehre");
                return new Event(EventType.Invalid);
        }
    }
}

interface EventConstructor<T> {
    new (...args: any[]): T;
}

// admin events
export class AdminEvent extends Event {
    constructor(type: EventType) {
        super(type);
    }
}

export class StartGame extends AdminEvent {
    constructor() {
        super(EventType.StartGame);
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
    constructor(public from: number, public to: number, public offer: string) {
        super(EventType.ProvideOffer);
    }
}

export class ProvideAnswer extends AdminEvent {
    constructor(public from: number, public fromName: string, public to: number, answer: string) {
        super(EventType.ProvideAnswer);
    }
}

export class FoodPosUpdate extends AdminEvent {
    constructor(public newPos: Position) {
        super(EventType.FoodPosUpdate);
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

