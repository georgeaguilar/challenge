export class RemoveTagCommand {
  constructor(
    public readonly imageId: string,
    public readonly tagId: string,
    public readonly collectionId: string,
    public readonly userId: string,
  ) {}
}
