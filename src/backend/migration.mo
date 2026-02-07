module {
  type OldActor = {};
  type NewActor = {
    lastCategoryId : Nat;
  };

  public func run(_ : OldActor) : NewActor {
    {
      lastCategoryId = 0;
    };
  };
};
