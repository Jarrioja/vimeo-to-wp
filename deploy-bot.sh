#!/bin/bash

echo "🚀 Desplegando bot de Telegram de manera segura..."
echo "=================================================="

# Paso 1: Eliminar todas las instancias previas
echo ""
echo "1️⃣ Eliminando instancias previas..."
./kill-all-bots.sh

# Paso 2: Compilar el proyecto
echo ""
echo "2️⃣ Compilando proyecto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en la compilación. Abortando..."
    exit 1
fi

echo "✅ Compilación exitosa"

# Paso 3: Iniciar el bot
echo ""
echo "3️⃣ Iniciando bot..."
echo "📱 El bot estará disponible en Telegram"
echo "💡 Comandos disponibles: /start, /publicar, /eliminar"
echo ""

# Iniciar en segundo plano y guardar logs
nohup node dist/scripts/telegram-bot.js > bot.log 2>&1 &

# Obtener el PID del proceso iniciado
BOT_PID=$!

# Esperar un momento para que inicie
sleep 3

# Verificar que se inició correctamente
if ps -p $BOT_PID > /dev/null; then
    echo "✅ Bot iniciado exitosamente (PID: $BOT_PID)"
    echo "📋 Logs guardados en: bot.log"
    echo ""
    echo "🎯 Para ver los logs en tiempo real:"
    echo "   tail -f bot.log"
    echo ""
    echo "🎯 Para detener el bot:"
    echo "   kill $BOT_PID"
    echo ""
    echo "🎯 Para reiniciar:"
    echo "   ./deploy-bot.sh"
else
    echo "❌ Error al iniciar el bot"
    echo "📋 Revisa los logs en: bot.log"
    exit 1
fi 