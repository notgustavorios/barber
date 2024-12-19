# init_db.py
from app import app, db, Service

def init_database():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if services already exist to avoid duplicates
        if Service.query.count() == 0:
            # Add default services
            services = [
                Service(
                    name='Haircut',
                    price=30.00,
                    description='Classic haircut with styling'
                ),
                Service(
                    name='Beard Trim',
                    price=15.00,
                    description='Professional beard grooming'
                ),
                Service(
                    name='Hair & Beard',
                    price=40.00,
                    description='Complete grooming package'
                ),
                Service(
                    name='Kids Haircut',
                    price=20.00,
                    description='Haircut for children under 12'
                ),
                Service(
                    name='Hot Towel Shave',
                    price=25.00,
                    description='Traditional straight razor shave with hot towel'
                )
            ]
            
            # Add all services to the database
            db.session.add_all(services)
            
            # Commit the changes
            db.session.commit()
            print("Database initialized with default services!")
        else:
            print("Services already exist in the database.")

if __name__ == '__main__':
    init_database()