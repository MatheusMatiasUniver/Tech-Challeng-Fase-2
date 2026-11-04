export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    // Campos extras devolvidos junto com `message` no corpo da resposta, por
    // exemplo um `code` estavel que o cliente usa para decidir o que fazer.
    public readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
