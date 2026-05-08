FROM python:3.11.14

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

RUN playwright install --with-deps chromium

COPY . .

EXPOSE 8000

CMD ["uvicorn" , "api:app", "--host", "0.0.0.0", "--port" , "8000", "--workers", "2", "--loop", "uvloop"]
