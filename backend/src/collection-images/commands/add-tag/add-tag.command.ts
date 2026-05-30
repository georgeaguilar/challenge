export class AddTagCommand {
  constructor(
    public readonly imageId: string,
    public readonly collectionId: string,
    public readonly userId: string,
    public readonly tagName: string,
  ) {}
}
