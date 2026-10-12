FROM node:26-alpine

# Install pnpm
RUN npm install -g pnpm@12 

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install project dependencies
RUN pnpm install --frozen-lockfile

# Copy application source
COPY . .

# Expose Metro bundler and API port
EXPOSE 8081

# Environment configurations
ENV NODE_ENV=development

# Default command to start the server
CMD ["pnpm", "start"]
