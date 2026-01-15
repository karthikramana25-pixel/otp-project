FROM postgres:latest

# Set default environment
ENV POSTGRES_DB=otpdb
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

# Copy SQL file (runs automatically at first start)
COPY db.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
