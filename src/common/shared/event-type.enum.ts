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
    NavigatedToGame,

    // neighbour
    HeadPosUpdate,
    HeadEntering,
    TailEntering,
    HeadPosLeavingContext
}
