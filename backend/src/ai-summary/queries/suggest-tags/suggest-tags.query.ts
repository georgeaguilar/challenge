export class SuggestTagsQuery {
  constructor(
    public readonly imageId: string,
    public readonly collectionId: string,
    public readonly userId: string,
  ) {}
}
