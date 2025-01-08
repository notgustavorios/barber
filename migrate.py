from flask_script import Manager
from flask_migrate import MigrateCommand
from app import app, db  # Import your app and db objects from app.py

# Create a manager instance to handle Flask commands
manager = Manager(app)

# Add migration command to the manager
manager.add_command('db', MigrateCommand)

if __name__ == '__main__':
    manager.run()
