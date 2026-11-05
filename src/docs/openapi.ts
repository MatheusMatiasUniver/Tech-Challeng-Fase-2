import type { OpenAPIV3 } from 'openapi-types'

// /teachers e /students tem o mesmo contrato; so mudam o rotulo e a tag.
function userPaths(
  label: string,
  tag: string,
  extraDelete: Partial<OpenAPIV3.OperationObject> = {},
): Record<string, OpenAPIV3.PathItemObject> {
  const json = (ref: string): Record<string, OpenAPIV3.MediaTypeObject> => ({
    'application/json': { schema: { $ref: ref } },
  })
  const common = {
    security: [{ bearerAuth: [] }],
    tags: [tag],
  }
  const denied = {
    '401': { $ref: '#/components/responses/Unauthorized' },
    '403': { $ref: '#/components/responses/TeacherOnly' },
  }

  return {
    collection: {
      get: {
        ...common,
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
        ],
        responses: {
          '200': {
            content: json('#/components/schemas/PaginatedUsers'),
            description: `Página de ${label}s ordenada por nome.`,
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          ...denied,
        },
        summary: `Lista ${label}s com paginação`,
      },
      post: {
        ...common,
        requestBody: {
          content: json('#/components/schemas/CreateUserRequest'),
          required: true,
        },
        responses: {
          '201': {
            content: json('#/components/schemas/User'),
            description: `${label} cadastrado.`,
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          ...denied,
          '409': { $ref: '#/components/responses/Conflict' },
        },
        summary: `Cadastra um ${label}`,
      },
    },
    item: {
      get: {
        ...common,
        parameters: [{ $ref: '#/components/parameters/UserId' }],
        responses: {
          '200': {
            content: json('#/components/schemas/User'),
            description: `${label} encontrado.`,
          },
          ...denied,
          '404': { $ref: '#/components/responses/UserNotFound' },
        },
        summary: `Retorna um ${label}`,
      },
      put: {
        ...common,
        parameters: [{ $ref: '#/components/parameters/UserId' }],
        requestBody: {
          content: json('#/components/schemas/UpdateUserRequest'),
          required: true,
        },
        responses: {
          '200': {
            content: json('#/components/schemas/User'),
            description: `${label} atualizado.`,
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          ...denied,
          '404': { $ref: '#/components/responses/UserNotFound' },
          '409': { $ref: '#/components/responses/Conflict' },
        },
        summary: `Atualiza um ${label} (senha só muda se for enviada)`,
      },
      delete: {
        ...common,
        parameters: [{ $ref: '#/components/parameters/UserId' }],
        responses: {
          '204': { description: `${label} removido.` },
          ...denied,
          '404': { $ref: '#/components/responses/UserNotFound' },
          '409': { $ref: '#/components/responses/Conflict' },
        },
        summary: `Remove um ${label}`,
        ...extraDelete,
      },
    },
  }
}

const teacherPaths = userPaths('professor', 'Professores', {
  description:
    'Professor com posts responde 409 com `code: TEACHER_HAS_POSTS` e `postsCount`. Para excluir o professor junto com os posts, repita a chamada com `deletePosts=true`. Ninguém pode excluir a própria conta (`code: CANNOT_DELETE_SELF`).',
  parameters: [
    { $ref: '#/components/parameters/UserId' },
    {
      description: 'Confirma a exclusão dos posts do professor junto com ele.',
      in: 'query',
      name: 'deletePosts',
      schema: { default: false, type: 'boolean' },
    },
  ],
})
const studentPaths = userPaths('aluno', 'Alunos')

export const openApiDocument: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    description:
      'API REST para uma plataforma de blogging voltada a docentes e alunos.',
    title: 'Tech Challenge Blogging API',
    version: '1.0.0',
  },
  tags: [
    { name: 'Autenticação' },
    { name: 'Posts' },
    { name: 'Comentários' },
    { name: 'Professores' },
    { name: 'Alunos' },
    { name: 'Operação' },
  ],
  paths: {
    '/health': {
      get: {
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
              },
            },
            description: 'API ativa.',
          },
        },
        summary: 'Verifica a disponibilidade da API',
        tags: ['Operação'],
      },
    },
    '/metrics': {
      get: {
        responses: {
          '200': {
            content: {
              'text/plain': {
                schema: { type: 'string' },
              },
            },
            description: 'Métricas no formato Prometheus.',
          },
        },
        summary: 'Expõe métricas Prometheus',
        tags: ['Operação'],
      },
    },
    '/auth/login': {
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
          required: true,
        },
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
            description: 'Autenticação realizada.',
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          '401': { $ref: '#/components/responses/InvalidCredentials' },
        },
        summary: 'Autentica um professor ou aluno',
        tags: ['Autenticação'],
      },
    },
    '/auth/me': {
      get: {
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
            description: 'Perfil do usuário dono do token.',
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
        security: [{ bearerAuth: [] }],
        summary: 'Retorna o usuário autenticado e seu papel',
        tags: ['Autenticação'],
      },
    },
    '/teachers': teacherPaths.collection,
    '/teachers/{id}': teacherPaths.item,
    '/students': studentPaths.collection,
    '/students/{id}': studentPaths.item,
    '/posts': {
      get: {
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Posts' },
              },
            },
            description: 'Lista de posts.',
          },
        },
        summary: 'Lista posts por data de criação',
        tags: ['Posts'],
      },
      post: {
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePostRequest' },
            },
          },
          required: true,
        },
        responses: {
          '201': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
            description: 'Post criado.',
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/TeacherOnly' },
        },
        security: [{ bearerAuth: [] }],
        summary: 'Cria um post (somente professores)',
        tags: ['Posts'],
      },
    },
    '/posts/search': {
      get: {
        parameters: [
          {
            in: 'query',
            name: 'q',
            required: true,
            schema: { minLength: 1, type: 'string' },
          },
        ],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Posts' },
              },
            },
            description: 'Posts encontrados por título ou conteúdo.',
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
        },
        summary: 'Busca posts por título ou conteúdo',
        tags: ['Posts'],
      },
    },
    '/posts/{id}': {
      get: {
        parameters: [{ $ref: '#/components/parameters/PostId' }],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
            description: 'Post encontrado.',
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        summary: 'Retorna um post pelo identificador',
        tags: ['Posts'],
      },
      put: {
        parameters: [{ $ref: '#/components/parameters/PostId' }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePostRequest' },
            },
          },
          required: true,
        },
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Post' },
              },
            },
            description: 'Post atualizado.',
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        security: [{ bearerAuth: [] }],
        summary: 'Atualiza um post do próprio autor (somente professores)',
        tags: ['Posts'],
      },
      delete: {
        parameters: [{ $ref: '#/components/parameters/PostId' }],
        responses: {
          '204': { description: 'Post removido.' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        security: [{ bearerAuth: [] }],
        summary: 'Remove um post do próprio autor (somente professores)',
        tags: ['Posts'],
      },
    },
    '/posts/{postId}/comments': {
      get: {
        parameters: [{ $ref: '#/components/parameters/CommentPostId' }],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Comments' },
              },
            },
            description:
              'Comentários do post, do mais antigo para o mais novo.',
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        summary: 'Lista os comentários de um post (público)',
        tags: ['Comentários'],
      },
      post: {
        parameters: [{ $ref: '#/components/parameters/CommentPostId' }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCommentRequest' },
            },
          },
          required: true,
        },
        responses: {
          '201': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Comment' },
              },
            },
            description: 'Comentário criado.',
          },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        security: [{ bearerAuth: [] }],
        summary: 'Comenta em um post (professor ou aluno logado)',
        tags: ['Comentários'],
      },
    },
    '/posts/{postId}/comments/{commentId}': {
      delete: {
        parameters: [
          { $ref: '#/components/parameters/CommentPostId' },
          {
            in: 'path',
            name: 'commentId',
            required: true,
            schema: { format: 'uuid', type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Comentário removido.' },
          '400': { $ref: '#/components/responses/InvalidRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
            description: 'Post ou comentário não encontrado.',
          },
        },
        security: [{ bearerAuth: [] }],
        summary:
          'Remove um comentário (autor do comentário ou professor autor do post)',
        tags: ['Comentários'],
      },
    },
  },
  components: {
    parameters: {
      Limit: {
        in: 'query',
        name: 'limit',
        schema: { default: 10, maximum: 50, minimum: 1, type: 'integer' },
      },
      Page: {
        in: 'query',
        name: 'page',
        schema: { default: 1, minimum: 1, type: 'integer' },
      },
      UserId: {
        in: 'path',
        name: 'id',
        required: true,
        schema: { format: 'uuid', type: 'string' },
      },
      CommentPostId: {
        in: 'path',
        name: 'postId',
        required: true,
        schema: { format: 'uuid', type: 'string' },
      },
      PostId: {
        in: 'path',
        name: 'id',
        required: true,
        schema: { format: 'uuid', type: 'string' },
      },
    },
    responses: {
      Conflict: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description:
          'E-mail já cadastrado, professor com posts ou exclusão da própria conta.',
      },
      TeacherOnly: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description: 'Acesso restrito a professores.',
      },
      UserNotFound: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description: 'Usuário não encontrado para este papel.',
      },
      Forbidden: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description:
          'Aluno tentando escrever ou professor que não é o autor do post.',
      },
      InvalidCredentials: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description: 'Email ou senha inválidos.',
      },
      InvalidRequest: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description: 'Dados da requisição inválidos.',
      },
      NotFound: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description: 'Post não encontrado.',
      },
      Unauthorized: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
          },
        },
        description: 'Token Bearer ausente ou inválido.',
      },
    },
    schemas: {
      Comment: {
        properties: {
          id: { format: 'uuid', type: 'string' },
          content: { type: 'string' },
          postId: { format: 'uuid', type: 'string' },
          authorId: { format: 'uuid', type: 'string' },
          createdAt: { format: 'date-time', type: 'string' },
          updatedAt: { format: 'date-time', type: 'string' },
          author: { $ref: '#/components/schemas/CommentAuthor' },
        },
        required: [
          'id',
          'content',
          'postId',
          'authorId',
          'createdAt',
          'updatedAt',
        ],
        type: 'object',
      },
      // Sem e-mail: a lista e publica e os autores podem ser alunos.
      CommentAuthor: {
        properties: {
          id: { format: 'uuid', type: 'string' },
          name: { type: 'string' },
          role: { enum: ['professor', 'aluno'], type: 'string' },
        },
        required: ['id', 'name', 'role'],
        type: 'object',
      },
      Comments: {
        items: { $ref: '#/components/schemas/Comment' },
        type: 'array',
      },
      CreateCommentRequest: {
        example: { content: 'Ótima explicação, obrigado!' },
        properties: {
          content: { maxLength: 1000, minLength: 1, type: 'string' },
        },
        required: ['content'],
        type: 'object',
      },
      CreatePostRequest: {
        example: { title: 'Meu primeiro post', content: 'Conteúdo do post.' },
        properties: {
          title: { maxLength: 255, minLength: 1, type: 'string' },
          content: { minLength: 1, type: 'string' },
        },
        required: ['title', 'content'],
        type: 'object',
      },
      Error: {
        example: { message: 'Dados da requisição inválidos' },
        properties: {
          message: { type: 'string' },
          code: {
            description: 'Código estável para o cliente tratar o erro.',
            example: 'TEACHER_HAS_POSTS',
            type: 'string',
          },
          postsCount: { type: 'integer' },
        },
        required: ['message'],
        type: 'object',
      },
      Health: {
        example: { status: 'ativo' },
        properties: { status: { example: 'ativo', type: 'string' } },
        required: ['status'],
        type: 'object',
      },
      LoginRequest: {
        example: { email: 'professor@exemplo.com', password: '123456' },
        properties: {
          email: { format: 'email', type: 'string' },
          password: { minLength: 1, type: 'string' },
        },
        required: ['email', 'password'],
        type: 'object',
      },
      LoginResponse: {
        properties: {
          access_token: { type: 'string' },
          token_type: { example: 'Bearer', type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
        required: ['access_token', 'token_type', 'user'],
        type: 'object',
      },
      Post: {
        properties: {
          id: { format: 'uuid', type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          authorId: { format: 'uuid', type: 'string' },
          createdAt: { format: 'date-time', type: 'string' },
          updatedAt: { format: 'date-time', type: 'string' },
          author: { $ref: '#/components/schemas/PostAuthor' },
        },
        required: [
          'id',
          'title',
          'content',
          'authorId',
          'createdAt',
          'updatedAt',
        ],
        type: 'object',
      },
      PostAuthor: {
        properties: {
          email: { format: 'email', type: 'string' },
          id: { format: 'uuid', type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name', 'email'],
        type: 'object',
      },
      Posts: {
        items: { $ref: '#/components/schemas/Post' },
        type: 'array',
      },
      User: {
        properties: {
          id: { format: 'uuid', type: 'string' },
          name: { type: 'string' },
          email: { format: 'email', type: 'string' },
          role: { enum: ['professor', 'aluno'], type: 'string' },
          createdAt: { format: 'date-time', type: 'string' },
          updatedAt: { format: 'date-time', type: 'string' },
        },
        required: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
        type: 'object',
      },
      PaginatedUsers: {
        properties: {
          data: { items: { $ref: '#/components/schemas/User' }, type: 'array' },
          meta: {
            properties: {
              limit: { type: 'integer' },
              page: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
            required: ['page', 'limit', 'total', 'totalPages'],
            type: 'object',
          },
        },
        required: ['data', 'meta'],
        type: 'object',
      },
      CreateUserRequest: {
        example: {
          name: 'Maria Silva',
          email: 'maria@exemplo.com',
          password: '123456',
        },
        properties: {
          name: { maxLength: 150, minLength: 1, type: 'string' },
          email: { format: 'email', type: 'string' },
          password: { maxLength: 72, minLength: 6, type: 'string' },
        },
        required: ['name', 'email', 'password'],
        type: 'object',
      },
      UpdateUserRequest: {
        example: { name: 'Maria S. Silva' },
        minProperties: 1,
        properties: {
          name: { maxLength: 150, minLength: 1, type: 'string' },
          email: { format: 'email', type: 'string' },
          password: { maxLength: 72, minLength: 6, type: 'string' },
        },
        type: 'object',
      },
      UpdatePostRequest: {
        example: { title: 'Título atualizado' },
        minProperties: 1,
        properties: {
          title: { maxLength: 255, minLength: 1, type: 'string' },
          content: { minLength: 1, type: 'string' },
        },
        type: 'object',
      },
    },
    securitySchemes: {
      bearerAuth: {
        bearerFormat: 'JWT',
        scheme: 'bearer',
        type: 'http',
      },
    },
  },
}
