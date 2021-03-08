export enum EventType {
    Invalid,

    //admin
    PlaceSnake,
    StartGame,
    StopGame,
    SetFood,
    PlacedFood,
    FoodPosUpdate,
    FoodEaten,
    Tick,
    RequestOffer,
    SetClientId,
    ProvideOffer,
    ProvideAnswer,
    ConnectionEstablished,

    // neighbour
    HeadPosUpdate,
    HeadEntering,
    TailEntering
}
