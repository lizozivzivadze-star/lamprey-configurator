FROM php:8.2-cli

WORKDIR /app

# Install PostgreSQL extension for PHP
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY . /app

# Expose the port Render expects
EXPOSE 10000

# Start PHP built-in server (using shell to expand $PORT variable)
CMD sh -c "php -S 0.0.0.0:${PORT:-10000} -t ."
