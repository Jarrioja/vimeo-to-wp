<?php
/**
 * Proteger endpoints de ACF
 * Agregar este código en functions.php o como un snippet
 */

add_filter('acf/rest_api/item_permissions/get', function($permission) {
    // Verificar si el usuario está autenticado o si hay autenticación básica
    return is_user_logged_in() || !empty($_SERVER['PHP_AUTH_USER']);
}, 100);

// Proteger específicamente los endpoints de opciones
add_filter('acf/rest_api/options_page_permissions/get', function($permission) {
    // Verificar si el usuario está autenticado y tiene capacidades de administrador
    // o si hay autenticación básica
    return current_user_can('manage_options') || !empty($_SERVER['PHP_AUTH_USER']);
}, 100); 