
# Database Migration Instructions

This guide explains the steps you need to follow to update your database schema whenever you make changes to your models in `app.py`.

## Prerequisites
Before starting, ensure you have the following dependencies installed:
1. **Flask** – The main framework for your app.
2. **Flask-SQLAlchemy** – To interact with the database.
3. **Flask-Migrate** – To handle database migrations.
4. **Flask-Script** – To manage commands like running migrations.

You can install them using `pip` if they are not already installed:
```bash
pip install Flask Flask-SQLAlchemy Flask-Migrate Flask-Script
```

## Step 1: Initialize Migrations (First Time Only)
If this is the first time you are setting up migrations in your project, run the following command to initialize the migration environment:

```bash
python manage.py db init
```

This will create a `migrations/` directory in your project to store migration scripts.

## Step 2: Make Changes to Your Models
Whenever you make changes to your models (e.g., adding a new field, updating a model, or creating a new model), follow these steps to update the database schema.

### Example Changes:
- Adding a new field to an existing model (e.g., `email` to the `Barber` model).
- Adding a new model (e.g., a `WaitList` model).

## Step 3: Generate a Migration Script
After making changes to your models, run the following command to generate a migration script. Be sure to include a descriptive message for the changes you made.

```bash
python manage.py db migrate -m "Description of changes"
```

For example:
```bash
python manage.py db migrate -m "Added email field to Barber model"
```

This will create a new migration file in the `migrations/versions/` directory.

## Step 4: Apply the Migration
To apply the migration and update your database schema, run the following command:

```bash
python manage.py db upgrade
```

This will apply the generated migration to your database, ensuring that the schema matches your updated models.

## Step 5: Verify the Changes
After running the migration, you can verify that the changes have been applied by checking your database (either through a database management tool or by querying the models in your app).

---

### Summary of Commands:

- **Initialize Migrations (First Time Only)**:
  ```bash
  python manage.py db init
  ```

- **Generate Migration Script (After Changing Models)**:
  ```bash
  python manage.py db migrate -m "Description of changes"
  ```

- **Apply the Migration**:
  ```bash
  python manage.py db upgrade
  ```

---

## Notes:
- Always run `python manage.py db migrate` and `python manage.py db upgrade` after making changes to your models to ensure the database schema stays in sync.
- If you encounter any issues with migrations, you can use the following command to show the status of your migrations:
  ```bash
  python manage.py db history
  ```

---

By following these steps, you can easily manage database schema updates and migrations whenever you make changes to your models. Let me know if you need further assistance!