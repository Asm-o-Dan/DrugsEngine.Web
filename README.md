# 🌐 DrugsEngine Ecosystem

Инженерная экосистема для сбора, агрегации, поиска и семантической векторизации медикаментов и аптечной номенклатуры.

```mermaid
flowchart TD
    subgraph Ingestion & Storage [C# / .NET 8 Backend]
        A[Web Scrapers] -->|Parsed Drug Data| B[Clean Architecture Core]
        B -->|CRUD / Persistence| C[(PostgreSQL DB)]
        B -->|Domain Events| D[Apache Kafka / RabbitMQ]
    end

    subgraph AI & Semantic Search [Python Microservice]
        D -->|Consume Ingestion Events| E[Embedding Service LaBSE]
        E -->|Store Vectors| F[(Qdrant Vector DB)]
        G[User Search Query] -->|Semantic Match| F
    end
```

---

## 📦 Компоненты системы

| Репозиторий / Модуль | Стек | Описание |
| :--- | :--- | :--- |
| [**DrugsEngine**](./DrugsEngine) | .NET 8, EF Core, PostgreSQL, OData, Kafka | Основной бэкенд, Clean Architecture, CQRS, парсинг аптек |
| [**DrugsEnginePythonService**](./pythonProject2) | Python 3.10, Qdrant, LaBSE, Kafka, RabbitMQ | Микросервис генерации векторных эмбеддингов и семантического поиска |
| [**SharedServices**](./SharedServices) | Docker Compose, Kafka, Zookeeper, RabbitMQ | Инфраструктурные сервисы шин сообщений и брокеров |

---

## 🚀 Быстрый запуск всей экосистемы

1. **Запуск инфраструктурных брокеров (Shared Services)**:
   ```bash
   cd SharedServices
   docker-compose up -d
   ```

2. **Запуск Python сервиса векторизации & Qdrant**:
   ```bash
   cd ../pythonProject2
   docker-compose up -d --build
   ```

3. **Запуск .NET бэкенда**:
   ```bash
   cd ../DrugsEngine/Infrastructure
   dotnet ef database update
   dotnet run
   ```

---

## 👨‍💻 Автор & Контакты
- **Даниил Гандапас** (Asm-o-Dan)
- GitHub: [github.com/Asm-o-Dan](https://github.com/Asm-o-Dan)
- Email: [dgandapas1@gmail.com](mailto:dgandapas1@gmail.com)
