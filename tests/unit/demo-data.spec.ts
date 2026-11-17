import { demoPosts, demoUsers } from '../../src/database/seeds/demo-data'

// O roteiro da apresentacao depende destes fatos; se alguem mudar o cenario,
// o teste avisa antes do dia da gravacao.
describe('Dados da apresentação', () => {
  const emails = demoUsers.map((user) => user.email)

  it('mantém as contas que o roteiro usa para entrar no app', () => {
    expect(emails).toEqual(
      expect.arrayContaining([
        'professor@exemplo.com',
        'professor1@exemplo.com',
        'professor2@exemplo.com',
        'aluno1@exemplo.com',
        'aluno2@exemplo.com',
      ]),
    )
  })

  it('não repete e-mails', () => {
    expect(new Set(emails).size).toBe(emails.length)
  })

  it('tem mais de 10 alunos, para existir a página 2 da lista', () => {
    const students = demoUsers.filter((user) => user.role === 'aluno')

    expect(students.length).toBeGreaterThan(10)
  })

  it('dá 3 posts ao professor1 e 2 ao professor2', () => {
    const countBy = (email: string): number =>
      demoPosts.filter((post) => post.authorEmail === email).length

    expect(countBy('professor1@exemplo.com')).toBe(3)
    expect(countBy('professor2@exemplo.com')).toBe(2)
  })

  it('só usa autores de posts que são professores e autores de comentários que existem', () => {
    const roleByEmail = new Map(
      demoUsers.map((user) => [user.email, user.role]),
    )

    for (const post of demoPosts) {
      expect(roleByEmail.get(post.authorEmail)).toBe('professor')

      for (const comment of post.comments) {
        expect(roleByEmail.has(comment.authorEmail)).toBe(true)
      }
    }
  })

  it('deixa um comentário do aluno2 em "Hooks na prática"', () => {
    const hooks = demoPosts.find((post) => post.title === 'Hooks na prática')

    expect(hooks?.comments.map((comment) => comment.authorEmail)).toEqual([
      'aluno2@exemplo.com',
    ])
  })
})
