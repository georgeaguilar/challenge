export class SearchImagesQuery {
  constructor(
    public readonly q: string,
    public readonly page: number = 1,
  ) {}
}
