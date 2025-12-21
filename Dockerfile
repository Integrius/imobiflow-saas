# Dockerfile para Render com Chromium
FROM node:18-bullseye

# Instalar Chromium e dependências
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Verificar instalação do Chromium
RUN which chromium || which chromium-browser || echo "Chromium not found"
RUN chromium --version || chromium-browser --version || echo "Cannot get version"

# Instalar pnpm
RUN npm install -g pnpm

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos do projeto
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build do projeto
WORKDIR /app/apps/api
# Prisma precisa de DATABASE_URL no build, mas pode ser qualquer valor válido
ENV DATABASE_URL="postgresql://temp:temp@localhost:5432/temp"
RUN pnpm run build

# Criar diretório para sessão WhatsApp
RUN mkdir -p /app/whatsapp-session && chmod 777 /app/whatsapp-session

# Tornar script de start executável
RUN chmod +x /app/apps/api/start.sh

# Configurar variáveis de ambiente do Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Expor porta
EXPOSE 3333

# Comando de inicialização com detecção automática do Chromium
CMD ["/app/apps/api/start.sh"]
