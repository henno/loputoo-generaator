FROM oven/bun:1-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    wget \
    ca-certificates \
    fontconfig \
    freetype \
    libstdc++ \
    font-liberation \
    font-dejavu \
    font-noto

# Install TeX Live with XeLaTeX
RUN apk add --no-cache \
    texlive-xetex \
    texmf-dist-latexextra \
    texmf-dist-fontsrecommended \
    texmf-dist-fontsextra \
    texmf-dist-langeuropean \
    texmf-dist-bibtexextra

# Install Pandoc (detect architecture)
ARG PANDOC_VERSION=3.6.2
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        PANDOC_ARCH="arm64"; \
    else \
        PANDOC_ARCH="amd64"; \
    fi && \
    wget -qO /tmp/pandoc.tar.gz "https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}/pandoc-${PANDOC_VERSION}-linux-${PANDOC_ARCH}.tar.gz" && \
    tar xzf /tmp/pandoc.tar.gz -C /tmp && \
    mv /tmp/pandoc-${PANDOC_VERSION}/bin/pandoc /usr/local/bin/ && \
    rm -rf /tmp/pandoc*

# Install pandoc-crossref (detect architecture)
ARG CROSSREF_VERSION=0.3.22b
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        CROSSREF_ARCH="ARM64"; \
    else \
        CROSSREF_ARCH="X64"; \
    fi && \
    wget -qO /tmp/pandoc-crossref.tar.xz "https://github.com/lierdakil/pandoc-crossref/releases/download/v${CROSSREF_VERSION}/pandoc-crossref-Linux-${CROSSREF_ARCH}.tar.xz" && \
    tar xf /tmp/pandoc-crossref.tar.xz -C /usr/local/bin/ && \
    rm /tmp/pandoc-crossref.tar.xz && \
    chmod +x /usr/local/bin/pandoc-crossref

# Verify installations
RUN pandoc --version && pandoc-crossref --version && xelatex --version

# Update font cache
RUN fc-cache -fv

# Application setup
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile 2>/dev/null || bun install

# Copy application code
COPY . .

# Build the application
RUN bun run build

# Create data directories
RUN mkdir -p /app/data/projects /app/data/schools /app/data/temp

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3200
ENV DATA_DIR=/app/data

EXPOSE 3200

CMD ["bun", "run", "start"]
