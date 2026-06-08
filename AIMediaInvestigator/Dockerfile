FROM python:3.11.14

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

RUN playwright install --with-deps chromium

COPY . .

EXPOSE 3001

CMD ["python", "app.py"]