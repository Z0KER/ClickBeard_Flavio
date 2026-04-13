# Diagrama Entidade-Relacionamento (DER) - ClickBeard

Este documento descreve a estrutura do banco de dados e os relacionamentos entre as entidades do sistema.

```mermaid
erDiagram
    Barber ||--o{ BarberSpecialty : expert-in
    Specialty ||--o{ BarberSpecialty : performed-by
    User ||--o{ Appointment : schedules
    Barber ||--o{ Appointment : serves
    Specialty ||--o{ Appointment : includes

    User {
        string id PK
        string name
        string email
        string role
    }

    Barber {
        string id PK
        string name
        int age
        datetime hireDate
    }

    Specialty {
        string id PK
        string name
    }

    BarberSpecialty {
        string barberId FK
        string specialtyId FK
    }

    Appointment {
        string id PK
        string clientId FK
        string barberId FK
        string specialtyId FK
        datetime startTime
        datetime endTime
        string status
    }
```

## Descrição das Entidades

### 1. User
Armazena tanto os clientes quanto os administradores. A diferenciação é feita pelo campo `role`.

### 2. Barber
Os profissionais da barbearia. Cada barbeiro pode ter múltiplas especialidades.

### 3. Specialty
Os serviços oferecidos (ex: Corte, Barba, Sobrancelha).

### 4. BarberSpecialty
Tabela de ligação (Many-to-Many) que define quais serviços cada barbeiro está apto a realizar.

### 5. Appointment
A entidade central que une o **Cliente**, o **Barbeiro**, o **Serviço** e o **Horário**.
