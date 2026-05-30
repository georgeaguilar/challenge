export class SearchImagesQuery {
  constructor(
    public readonly q: string,
    public readonly page: number = 1,
    public readonly yearStart?: number,
    public readonly yearEnd?: number,
    public readonly mediaType: string = 'image',
  ) {}
}
