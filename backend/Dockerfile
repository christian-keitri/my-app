# backend/Dockerfile

FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Generate Prisma client
RUN npm install prisma --prefix ./ && npx --prefix ./ prisma generate --schema=./prisma/schema.prisma

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
