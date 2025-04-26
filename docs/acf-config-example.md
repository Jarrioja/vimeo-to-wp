# Configuración de ACF

## Página de Opciones

1. En el menú de WordPress, ve a "Custom Fields" > "Tools"
2. Importa el siguiente código JSON para crear la estructura base:

```json
{
    "key": "group_clases_grabadas",
    "title": "Configuración de Clases Grabadas",
    "fields": [
        {
            "key": "field_dia_1",
            "label": "Lunes",
            "name": "dia_1",
            "type": "group",
            "layout": "block",
            "sub_fields": [
                {
                    "key": "field_dia_1_category",
                    "label": "Categoría",
                    "name": "category",
                    "type": "taxonomy",
                    "taxonomy": "categoria_de_clase_grabada",
                    "return_format": "object"
                },
                {
                    "key": "field_dia_1_trainer",
                    "label": "Entrenador",
                    "name": "trainer",
                    "type": "text"
                }
            ]
        }
    ],
    "location": [
        [
            {
                "param": "options_page",
                "operator": "==",
                "value": "acf-options"
            }
        ]
    ],
    "menu_order": 0,
    "position": "normal",
    "style": "default",
    "label_placement": "top",
    "instruction_placement": "label",
    "active": true
}
```

Este ejemplo muestra la configuración para el Lunes. Deberás repetir el grupo `dia_X` para cada día de la semana (del 1 al 6).

## Estructura Resultante

La configuración anterior creará campos en WordPress que generarán la siguiente estructura en la API:

```json
{
    "acf": {
        "dia_1": {
            "category": {
                "term_id": 123,
                "name": "Yoga",
                "slug": "yoga"
            },
            "trainer": "Juan Pérez"
        },
        "dia_2": {
            // ... similar structure for other days
        }
    }
}
```

## Acceso vía API

Los campos estarán disponibles en:
```
GET /wp-json/acf/v3/options/options
```

## Notas Importantes

1. Asegúrate de que la taxonomía `categoria_de_clase_grabada` esté creada en WordPress antes de importar esta configuración
2. La página de opciones debe estar habilitada en ACF
3. Los permisos de la API deben estar configurados correctamente (ver archivo `protect-acf-endpoints.php`) 