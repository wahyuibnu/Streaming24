#!/bin/bash
set -e

echo "=================================================="
echo "🚀 StreamAuto 24/7 - Auto Installer"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[*] Docker tidak ditemukan. Menginstal Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
else
    echo "[*] Docker sudah terinstal."
fi

# Clone repository if not exists
if [ -d "Streaming24" ]; then
    echo "[*] Direktori Streaming24 sudah ada. Melakukan git pull..."
    cd Streaming24
    git pull
else
    echo "[*] Mengunduh repository Streaming24..."
    git clone https://github.com/wahyuibnu/Streaming24.git
    cd Streaming24
fi

# Setup .env
if [ ! -f ".env" ]; then
    echo "[*] Membuat file .env dari template..."
    cp .env.example .env
    echo "=================================================="
    echo "⚠️ PENTING: Edit file .env sekarang untuk mengatur"
    echo "ADMIN_PASSWORD dan STREAM KEY Anda menggunakan nano/vim."
    echo "=================================================="
else
    echo "[*] File .env sudah ada."
fi

echo "[*] Membangun dan menyalakan kontainer Docker..."
docker compose up -d --build

echo "=================================================="
echo "✅ Instalasi Selesai!"
echo "Akses Dashboard Anda di: http://$(curl -s ifconfig.me):8080"
echo "=================================================="
