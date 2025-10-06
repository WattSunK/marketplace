@echo off
echo 1. Login
curl -s -c session.txt -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"pass123\"}" http://127.0.0.1:3101/api/login
echo 2. Whoami
curl -s -b session.txt http://127.0.0.1:3101/api/_whoami
echo 3. Admin
curl -s -b session.txt http://127.0.0.1:3101/api/admin
echo 4. Logout
curl -s -b session.txt -X POST http://127.0.0.1:3101/api/logout
echo 5. Whoami after logout
curl -s -b session.txt http://127.0.0.1:3101/api/_whoami

