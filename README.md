# ClickBeard - Sistema de Agendamento de Barbearia

Este projeto é uma aplicação fullstack moderna para gestão de agendamentos em uma barbearia premium. Focado em experiência do usuário (UX) e consistência de dados.

## Tecnologias Utilizadas

- **Frontend**: React (Vite), TypeScript, Zustand (Estado), Axios, Lucide React (Icons), Vanilla CSS.
- **Backend**: Node.js (ESM), Express 5, TypeScript, Prisma ORM, JWT, Bcrypt, Zod v4.
- **Banco de Dados**: PostgreSQL (executado via Docker).

## Funcionalidades Principais

- **Wizard de Agendamento em 4 Passos**:
    1. Escolha da Especialidade.
    2. Escolha do Barbeiro (filtramos apenas os que realizam o serviço).
    3. Escolha do Dia (próximos 7 dias, seg-sáb).
    4. Escolha do Horário (apenas horários livres aparecem como disponíveis).
- **Prevenção de Conflitos Real-time**:
    - O frontend consulta a disponibilidade do barbeiro e bloqueia horários já ocupados.
    - O backend possui uma `UNIQUE CONSTRAINT` no banco de dados para garantir que não existam dois agendamentos no mesmo minuto para o mesmo profissional.
- **Tratamento de Fuso Horário**: Normalização de datas via UTC para garantir consistência entre cliente e servidor.
- **Painéis Diferenciados**:
    - **Cliente**: Gerenciamento de suas reservas e cancelamentos (até 2h antes).
    - **Admin**: Visão completa da agenda da barbearia.

---

## Como Rodar o Projeto

### 1. Banco de Dados (Docker)

O projeto utiliza Docker para o banco de dados. Certifique-se de que o Docker Desktop esteja rodando.

```bash
docker-compose up -d
```

_O banco estará disponível internamente no container, e mapeado para a porta **5433** do seu host._

### 2. Backend

1. Entre na pasta `backend`:
    ```bash
    cd backend
    npm install
    ```
2. Configure o `.env` (as credenciais padrão já estão configuradas para o Docker).
3. Prepare o banco de dados:
    ```bash
    npx prisma migrate dev --name init
    npm run seed
    ```
4. Inicie o servidor:
    ```bash
    npm run dev
    ```

### 3. Frontend

1. Entre na pasta `frontend`:
    ```bash
    cd frontend
    npm install
    ```
2. Inicie a aplicação:

    ```bash
    npm run dev
    ```

    Acesse: `http://localhost:5173`

---

## Resetando o Ambiente de Testes

Se precisar limpar todos os dados e começar do zero (resetando agendamentos e rodando o seed novamente), execute na pasta `backend`:

```bash
npx prisma migrate reset
```

---

## Documentação Técnica

- **DER**: O Diagrama Entidade-Relacionamento atualizado está disponível em `DER.md` na raiz do projeto.
- **ORM**: O Prisma gerencia todo o esquema. O arquivo principal está em `backend/prisma/schema.prisma`.
- **Scripts SQL**: Localizados em `database/legacy/init.sql`.
    - _Nota: Estes scripts são meramente representativos para cumprimento dos requisitos do teste. O projeto utiliza o Prisma para gerenciamento real do banco._

---

## Credenciais de Teste

- **Admin**: `admin@clickbeard.com` / `admin123`
- **Cliente**: Pode ser criado qualquer usuário novo via tela de Cadastro.
