#!/bin/bash

echo "🤖 Iniciando bot de Telegram de manera segura..."

# Terminar cualquier instancia previa del bot
echo "🛑 Terminando instancias previas del bot..."
pkill -f telegram-bot
sleep 2

# Verificar que no queden procesos
REMAINING_PROCESSES=$(ps aux | grep telegram-bot | grep -v grep | wc -l)
if [ $REMAINING_PROCESSES -gt 0 ]; then
    echo "⚠️ Aún quedan procesos del bot. Forzando terminación..."
    pkill -9 -f telegram-bot
    sleep 1
fi

# Compilar el proyecto
echo "🔨 Compilando proyecto..."
npm run build

# Iniciar el bot
echo "🚀 Iniciando bot..."
node dist/scripts/telegram-bot.js 