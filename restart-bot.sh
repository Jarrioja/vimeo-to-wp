#!/bin/bash

echo "🔄 Reiniciando bot de Telegram..."

# Buscar y terminar procesos del bot
echo "📋 Buscando procesos del bot..."
BOT_PID=$(ps aux | grep telegram-bot | grep -v grep | awk '{print $2}')

if [ ! -z "$BOT_PID" ]; then
    echo "🛑 Terminando proceso $BOT_PID..."
    kill $BOT_PID
    sleep 2
else
    echo "ℹ️ No se encontraron procesos del bot ejecutándose"
fi

# Compilar el proyecto
echo "🔨 Compilando proyecto..."
npm run build

# Reiniciar el bot
echo "🚀 Iniciando bot..."
node dist/scripts/telegram-bot.js 