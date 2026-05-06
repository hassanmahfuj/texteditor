# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container at /app
COPY . .

# Make sure the files directory exists and is writable
RUN mkdir -p files && chmod 777 files

# Expose the port the app runs on
EXPOSE 5000

# Define environment variable
ENV FLASK_APP=app.py

# Run the application
# If FLASK_ENV is production, use gunicorn, otherwise use python app.py
CMD if [ "$FLASK_ENV" = "production" ]; then exec gunicorn -w 4 -b 0.0.0.0:5000 app:app; else exec python app.py; fi
