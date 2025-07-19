#!/bin/bash

echo "🗑️ Eliminando TODAS las instancias del bot de Telegram..."

# Buscar todos los procesos relacionados con el bot
echo "🔍 Buscando procesos del bot..."

# Buscar por nombre del archivo
BOT_PROCESSES=$(ps aux | grep "telegram-bot" | grep -v grep | awk '{print $2}')

# Buscar por node y el script
NODE_PROCESSES=$(ps aux | grep "node.*telegram-bot" | grep -v grep | awk '{print $2}')

# Buscar por el directorio del proyecto
PROJECT_PROCESSES=$(ps aux | grep "vimeo-to-wordpress-post" | grep -v grep | awk '{print $2}')

# Combinar todos los PIDs únicos
ALL_PIDS=$(echo "$BOT_PROCESSES $NODE_PROCESSES $PROJECT_PROCESSES" | tr ' ' '\n' | sort -u | grep -v '^$')

if [ -z "$ALL_PIDS" ]; then
    echo "✅ No se encontraron procesos del bot ejecutándose"
else
    echo "📋 Procesos encontrados:"
    echo "$ALL_PIDS" | while read pid; do
        if [ ! -z "$pid" ]; then
            echo "  - PID: $pid"
            ps -p $pid -o pid,ppid,cmd --no-headers 2>/dev/null || echo "    (Proceso no encontrado)"
        fi
    done
    
    echo ""
    echo "🛑 Terminando procesos..."
    
    # Terminar procesos de manera normal
    echo "$ALL_PIDS" | while read pid; do
        if [ ! -z "$pid" ]; then
            echo "  Terminando PID $pid..."
            kill $pid 2>/dev/null
        fi
    done
    
    # Esperar un poco
    sleep 3
    
    # Verificar si quedan procesos y forzar terminación
    REMAINING_PIDS=$(ps aux | grep "telegram-bot\|vimeo-to-wordpress-post" | grep -v grep | awk '{print $2}')
    
    if [ ! -z "$REMAINING_PIDS" ]; then
        echo "⚠️ Algunos procesos persisten. Forzando terminación..."
        echo "$REMAINING_PIDS" | while read pid; do
            if [ ! -z "$pid" ]; then
                echo "  Forzando terminación de PID $pid..."
                kill -9 $pid 2>/dev/null
            fi
        done
    fi
    
    echo "✅ Procesos terminados"
fi

echo ""
echo "🔍 Verificación final..."
REMAINING=$(ps aux | grep "telegram-bot\|vimeo-to-wordpress-post" | grep -v grep | wc -l)

if [ $REMAINING -eq 0 ]; then
    echo "✅ No quedan procesos del bot ejecutándose"
else
    echo "⚠️ Aún quedan $REMAINING procesos:"
    ps aux | grep "telegram-bot\|vimeo-to-wordpress-post" | grep -v grep
fi

echo ""
echo "🎯 Script completado. Ahora puedes iniciar el bot de manera segura." 