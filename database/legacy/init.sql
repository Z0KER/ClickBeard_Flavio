-- ############################################################################
-- # AVISO: ESTE ARQUIVO É MERAMENTE REPRESENTATIVO (REQUISITO DO TESTE)      #
-- # O CLICKBEARD UTILIZA O PRISMA ORM PARA GERENCIAR O BANCO DE DATOS.      #
-- # NÃO É NECESSÁRIO EXECUTAR ESTE SCRIPT PARA RODAR O PROJETO.              #
-- ############################################################################

-- Tabela de Usuários (Clientes e Admins)
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- Tabela de Barbeiros
CREATE TABLE "barbers" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "hireDate" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- Tabela de Especialidades
CREATE TABLE "specialties" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- Tabela de Ligação Barbeiro-Especialidade (NxN)
CREATE TABLE "barber_specialties" (
    "barberId" TEXT REFERENCES "barbers"("id") ON DELETE CASCADE,
    "specialtyId" TEXT REFERENCES "specialties"("id") ON DELETE CASCADE,
    PRIMARY KEY ("barberId", "specialtyId")
);

-- Tabela de Agendamentos
CREATE TABLE "appointments" (
    "id" TEXT PRIMARY KEY,
    "clientId" TEXT REFERENCES "users"("id"),
    "barberId" TEXT REFERENCES "barbers"("id"),
    "specialtyId" TEXT REFERENCES "specialties"("id"),
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "unique_barber_time" UNIQUE ("barberId", "startTime")
);
