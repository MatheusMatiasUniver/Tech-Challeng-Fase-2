#!/usr/bin/env bash
# Sobe a API local com Docker e deixa o banco no cenario da apresentacao.
# Pode ser rodado quantas vezes quiser: cada execucao apaga e recria os dados.
#
# Uso (na raiz do repositorio): ./scripts/reset-demo.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Arquivo .env nao encontrado. Crie com: cp .env.example .env (e preencha usuario, senha e JWT_SECRET)." >&2
  exit 1
fi

echo "1/4 Gerando a imagem da API com o codigo atual..."
docker compose build api

echo "2/4 Subindo o PostgreSQL e esperando ele ficar pronto..."
docker compose up -d --wait postgres

# Container avulso (run --rm) em vez de exec no container da API: assim o
# reset nao concorre com as migrations que a API roda ao iniciar.
echo "3/4 Aplicando migrations e recriando os dados da apresentacao..."
docker compose run --rm --no-deps api node build/database/seeds/reset-demo.js --yes

echo "4/4 Subindo a API..."
docker compose up -d api

echo
echo "Ambiente pronto. Teste com: curl http://localhost:3001/health"
echo "Contas (senha 123456): professor@, professor1@, professor2@, aluno1@ ... aluno12@exemplo.com"
