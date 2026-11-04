// Lancado pelo repositorio quando o banco recusa excluir um usuario que
// ainda e autor de posts (FK com ON DELETE RESTRICT).
export class UserHasPostsError extends Error {
  constructor() {
    super('Usuário possui posts publicados')
    this.name = 'UserHasPostsError'
  }
}
