# app.py
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from dotenv import load_dotenv
import sqlite3
import os

#load env
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///barber_clips.db'
db = SQLAlchemy(app)

# Database Models
class Barber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    work_address = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    is_active = db.Column(db.Boolean, default=False)
    current_queue = db.relationship('WaitList', backref='barber', lazy=True)
    
class WaitList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    barber_id = db.Column(db.Integer, db.ForeignKey('barber.id'), nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='waiting')  # waiting, completed, cancelled

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)

with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/barber/register', methods=['GET', 'POST'])
def barber_register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        name = request.form['name']
        address = request.form['address']
        latitude = request.form['latitude']
        longitude = request.form['longitude']

        # Validate required fields
        if not all([username, password, confirm_password, name, address, latitude, longitude]):
            flash('All fields are required')
            return redirect(url_for('barber_register'))

        # Check if passwords match
        if password != confirm_password:
            flash('Passwords do not match')
            return redirect(url_for('barber_register'))

        # Check password length
        if len(password) < 8:
            flash('Password must be at least 8 characters long')
            return redirect(url_for('barber_register'))

        # Check if username already exists
        if Barber.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('barber_register'))

        try:
            # Create new barber
            new_barber = Barber(
                username=username,
                password_hash=generate_password_hash(password),
                name=name,
                work_address=address,  # Add this field to your Barber model
                latitude=float(latitude),
                longitude=float(longitude)
            )
            
            db.session.add(new_barber)
            db.session.commit()
            
            flash('Registration successful! Please log in.')
            return redirect(url_for('barber_login'))
            
        except Exception as e:
            db.session.rollback()
            flash('An error occurred during registration. Please try again.')
            return redirect(url_for('barber_register'))
    places_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    return render_template('barber_register.html', places_api_key=places_api_key)

@app.route('/barber/login', methods=['GET', 'POST'])
def barber_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        barber = Barber.query.filter_by(username=username).first()
        
        if barber and check_password_hash(barber.password_hash, password):
            session['barber_id'] = barber.id
            flash('Logged in successfully')
            return redirect(url_for('barber_dashboard'))
            
        flash('Invalid username or password')
    return render_template('barber_login.html')

@app.route('/barber/logout')
def barber_logout():
    session.pop('barber_id', None)
    flash('Logged out successfully')
    return redirect(url_for('home'))

@app.route('/barber/dashboard')
def barber_dashboard():
    if 'barber_id' not in session:
        return redirect(url_for('barber_login'))
        
    barber = Barber.query.get(session['barber_id'])
    waitlist = WaitList.query.filter_by(barber_id=barber.id, status='waiting').all()
    return render_template('barber_dashboard.html', barber=barber, waitlist=waitlist)

@app.route('/barber/toggle-status', methods=['POST'])
def toggle_status():
    if 'barber_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
        
    barber = Barber.query.get(session['barber_id'])
    barber.is_active = not barber.is_active
    
    if barber.is_active:
        lat = request.form.get('latitude')
        lng = request.form.get('longitude')
        barber.latitude = float(lat)
        barber.longitude = float(lng)
    
    db.session.commit()
    return jsonify({'status': 'success', 'is_active': barber.is_active})

@app.route('/find-barbers')
def find_barbers():
    google_maps_key = os.getenv("GOOGLE_MAPS_API_KEY")
    active_barbers = Barber.query.filter_by(is_active=True).all()
    barbers_data = [{
        'id': b.id,
        'name': b.name,
        'latitude': b.latitude,
        'longitude': b.longitude,
        'wait_time': len(b.current_queue)
    } for b in active_barbers]
    
    return render_template('find_barbers.html', barbers=barbers_data, google_maps_key=google_maps_key)

@app.route('/join-waitlist/<int:barber_id>', methods=['POST'])
def join_waitlist(barber_id):
    name = request.form['name']
    phone = request.form['phone']
    
    waitlist_entry = WaitList(
        barber_id=barber_id,
        customer_name=name,
        phone_number=phone
    )
    
    db.session.add(waitlist_entry)
    db.session.commit()
    
    flash('Added to waitlist successfully')
    return redirect(url_for('find_barbers'))

@app.route('/services')
def services():
    services = Service.query.all()
    return render_template('services.html', services=services)

if __name__ == '__main__':
    app.run(debug=True)