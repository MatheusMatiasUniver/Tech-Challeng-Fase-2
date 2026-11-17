import { type UserRole } from '../../entities/user.entity'

// Cenario da apresentacao da Fase 4 (roteiro do video). Fica separado do
// script de reset para que os dados possam ser lidos e testados sem abrir
// conexao com o banco.
//
// Todas as contas usam a mesma senha das contas do seed original.
export const DEMO_PASSWORD = '123456'

export interface DemoUser {
  name: string
  email: string
  role: UserRole
}

export interface DemoComment {
  authorEmail: string
  content: string
}

export interface DemoPost {
  title: string
  content: string
  authorEmail: string
  comments: DemoComment[]
}

// As cinco contas do seed original continuam aqui com os mesmos e-mails,
// porque o roteiro e o README citam esses logins.
const seedUsers: DemoUser[] = [
  { name: 'Professor', email: 'professor@exemplo.com', role: 'professor' },
  { name: 'Professor 1', email: 'professor1@exemplo.com', role: 'professor' },
  { name: 'Professor 2', email: 'professor2@exemplo.com', role: 'professor' },
  { name: 'Aluno 1', email: 'aluno1@exemplo.com', role: 'aluno' },
  { name: 'Aluno 2', email: 'aluno2@exemplo.com', role: 'aluno' },
]

// Mais 10 alunos para chegar a 12: a lista do app mostra 10 por pagina, entao
// a demo tem "Pagina 1 de 2". Mesmo depois de a demo excluir um aluno e
// cadastrar a Ana Lima, continuam 12 e a pagina 2 nao some.
const extraStudentNames = [
  'Beatriz Souza',
  'Carlos Pereira',
  'Daniela Costa',
  'Eduardo Martins',
  'Fernanda Alves',
  'Gabriel Rocha',
  'Helena Ribeiro',
  'Igor Fernandes',
  'Juliana Carvalho',
  'Lucas Gomes',
]

const extraStudents: DemoUser[] = extraStudentNames.map((name, index) => ({
  name,
  email: `aluno${index + 3}@exemplo.com`,
  role: 'aluno',
}))

export const demoUsers: DemoUser[] = [...seedUsers, ...extraStudents]

// Ordem cronologica: o primeiro post e o mais antigo. A API lista do mais
// novo para o mais antigo, entao o ultimo daqui aparece no topo do app.
export const demoPosts: DemoPost[] = [
  {
    title: 'Git para iniciantes',
    authorEmail: 'professor2@exemplo.com',
    content: [
      'Git é o sistema de controle de versão mais usado no mercado. Ele guarda o histórico de cada arquivo do projeto e permite voltar a qualquer versão anterior.',
      'Os comandos do dia a dia são poucos: git status mostra o que mudou, git add escolhe o que vai para o próximo commit, git commit grava esse ponto da história e git push envia os commits para o repositório remoto.',
      'Trabalhe sempre em branches. Cada funcionalidade nasce em um branch próprio e volta para o principal por meio de um pull request, onde outra pessoa revisa o código antes do merge.',
    ].join('\n\n'),
    comments: [],
  },
  {
    title: 'Revisão de SQL',
    authorEmail: 'professor2@exemplo.com',
    content: [
      'SQL é a linguagem usada para consultar e alterar dados em bancos relacionais como o PostgreSQL.',
      'O SELECT busca linhas, o WHERE filtra, o ORDER BY ordena e o JOIN junta tabelas pela chave estrangeira. INSERT, UPDATE e DELETE alteram os dados.',
      'Uma chave estrangeira garante que um registro só aponte para outro que existe. A opção ON DELETE decide o que acontece quando o registro apontado é apagado: CASCADE apaga junto, RESTRICT impede a exclusão.',
    ].join('\n\n'),
    comments: [],
  },
  {
    title: 'Como funciona o JWT',
    authorEmail: 'professor1@exemplo.com',
    content: [
      'JWT (JSON Web Token) é um formato de token usado para autenticação em APIs. Depois do login, o servidor devolve um token assinado, e o cliente o envia no cabeçalho Authorization de cada requisição.',
      'O token tem três partes separadas por pontos: o cabeçalho, o conteúdo (payload) e a assinatura. A assinatura é calculada com uma chave secreta que só o servidor conhece, por isso ninguém consegue alterar o conteúdo sem invalidar o token.',
      'O payload não é criptografado, apenas codificado em Base64. Nunca coloque senhas ou dados sensíveis nele, e defina sempre um prazo de expiração.',
    ].join('\n\n'),
    comments: [],
  },
  {
    title: 'Hooks na prática',
    authorEmail: 'professor1@exemplo.com',
    content: [
      'Hooks são funções que permitem usar estado e outros recursos do React em componentes funcionais.',
      'O useState guarda um valor que, ao mudar, faz o componente renderizar de novo. O useEffect executa efeitos colaterais, como buscar dados na API, depois da renderização; a lista de dependências decide quando ele roda outra vez.',
      'O useRef guarda um valor que sobrevive entre renderizações sem provocar uma nova. É útil, por exemplo, para descartar a resposta de uma busca antiga que chegou depois da busca nova.',
      'Por fim, crie seus próprios hooks quando a mesma lógica aparecer em mais de uma tela. Um hook personalizado é só uma função que começa com use e chama outros hooks.',
    ].join('\n\n'),
    comments: [
      {
        authorEmail: 'aluno2@exemplo.com',
        content:
          'Ficou bem mais claro a diferença entre useState e useRef. Obrigado, professor!',
      },
    ],
  },
  {
    title: 'Introdução ao React Native',
    authorEmail: 'professor1@exemplo.com',
    content: [
      'React Native é um framework para criar aplicativos Android e iOS usando React e JavaScript ou TypeScript. Os componentes viram elementos nativos de verdade, e não uma página web dentro do app.',
      'Em vez de div e span, usamos View e Text. O estilo é escrito em objetos JavaScript com StyleSheet, e o layout usa Flexbox, com a coluna como direção padrão.',
      'O jeito mais rápido de começar é o Expo: com npx create-expo-app o projeto já nasce configurado, e o aplicativo Expo Go roda o código no celular lendo um QR Code.',
    ].join('\n\n'),
    comments: [],
  },
]
