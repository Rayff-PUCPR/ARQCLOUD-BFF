# BFF - RotaCerta

## Alunos

- Ícaro Rayff de Souza
- Armando de Souza Stein

Backend for Frontend da aplicação RotaCerta. Ele é a camada consumida diretamente pelo Microfrontend e centraliza agregação, proxy e orquestração das chamadas para os serviços internos.

## Descrição da arquitetura

O BFF segue uma organização inspirada em Clean Architecture e Vertical Slice. Os controllers expõem os endpoints HTTP, os use cases concentram a orquestração de aplicação, e os clients em `src/shared/clients` isolam a comunicação HTTP com os demais componentes.

Fluxo principal:

```txt
Microfrontend -> BFF -> Microservico-SQL
                  -> Microservico-Mongo
                  -> Azure-Function
```

O endpoint obrigatório da entrega é:

```http
GET /aggregated-data
```

Esse endpoint consulta pedidos e motoristas no Microserviço SQL, rotas no Microserviço Mongo e cálculo auxiliar na Azure Function, retornando uma resposta consolidada para o frontend.

## Tecnologias utilizadas

- Node.js
- TypeScript
- NestJS
- Swagger / OpenAPI
- Vitest
- dotenv

## Como rodar localmente

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente, se necessário:

```env
PORT=3000
ORDERS_SERVICE_URL=http://localhost:3001
ROUTES_SERVICE_URL=http://localhost:3002
CALCULATION_FUNCTION_URL=http://localhost:7071/api/calculate-route
```

Inicie o serviço:

```bash
npm run dev
```

Endereços locais:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

Endpoints principais:

- `GET /aggregated-data`
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `POST /api/v1/drivers`
- `PATCH /api/v1/orders/:id/status`
- `GET /api/v1/routes/available`
- `POST /api/v1/routes/calculate`
- `POST /api/v1/routes/:id/accept`
- `POST /api/v1/routes/:id/location`
- `POST /api/v1/routes/:id/occurrences`
- `POST /api/v1/routes/:id/stops/:orderId/complete`

Para rodar os testes:

```bash
npm test
```

## Docker

Build local da imagem:

```bash
docker build -t rotacerta-bff:v1 .
```

Execucao local em container, acessando os microservicos que estao rodando na maquina host:

```bash
docker run --rm -p 3000:3000 \
  -e ORDERS_SERVICE_URL=http://host.docker.internal:3001 \
  -e ROUTES_SERVICE_URL=http://host.docker.internal:3002 \
  -e CALCULATION_FUNCTION_URL=https://rota-certa-2026-beaja6c8g7esbxfm.eastus-01.azurewebsites.net/api/calculate-route \
  rotacerta-bff:v1
```

Publicacao no Docker Hub:

```bash
docker login
docker build -t rayff/rotacerta-bff:v1 .
docker push rayff/rotacerta-bff:v1
```
