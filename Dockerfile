FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Expose the port React Router will run on
EXPOSE 3000

# Start the React Router server directly
# --host 0.0.0.0 is MANDATORY for Docker
CMD ["npx", "react-router-serve", "./build/server/index.js", "--host", "0.0.0.0"]