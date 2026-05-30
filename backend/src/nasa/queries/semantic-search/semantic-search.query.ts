export class SemanticSearchQuery {
  constructor(
    public readonly naturalQuery: string,
    public readonly page: number = 1,
  ) {}
}
