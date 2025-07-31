FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY Roblox/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Django backend
COPY Roblox/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/build ./frontend/build/

# Configure nginx
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# Start script
COPY start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]