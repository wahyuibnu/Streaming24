FROM node:18-bullseye-slim

# Install FFmpeg and Fonts
RUN apt-get update && \
    apt-get install -y ffmpeg fonts-dejavu-core && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 8080

# Run the app
CMD ["npm", "start"]
