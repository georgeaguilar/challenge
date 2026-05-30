export class DeleteCollectionCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
