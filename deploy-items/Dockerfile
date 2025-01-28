# Stage 1: Build the Astro site
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Astro site
RUN npm run build

# Stage 2: Serve the static files
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

# Copy the built files from the builder stage
COPY --from=builder /app/dist /app/dist

# Expose port 3000 (default for serve)
EXPOSE 3000

# Start serve
CMD ["serve", "-s", "dist", "-l", "4321"]