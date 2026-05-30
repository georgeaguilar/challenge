export class GetCollectionImageQuery {
  constructor(
    public readonly imageId: string,
    public readonly collectionId: string,
    public readonly userId: string,
  ) {}
}
