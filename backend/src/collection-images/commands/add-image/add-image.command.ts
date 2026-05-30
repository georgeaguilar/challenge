export class AddImageCommand {
  constructor(
    public readonly collectionId: string,
    public readonly userId: string,
    public readonly nasaId: string,
    public readonly title: string,
    public readonly url: string,
    public readonly date?: string,
    public readonly description?: string,
  ) {}
}
