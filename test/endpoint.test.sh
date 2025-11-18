#!/bin/bash

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
BASE_URL="${BASE_URL:-http://localhost:8008}"
TEST_DATA_FILE="endpointData.test.json"
VERBOSE="${VERBOSE:-false}"

# Función para imprimir encabezados
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Función para imprimir resultados
print_result() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}✗ FAIL${NC}: $message"
    elif [ "$status" = "INFO" ]; then
        echo -e "${YELLOW}ℹ INFO${NC}: $message"
    fi
}

# Función para validar que existe jq
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq no está instalado${NC}"
        echo "Por favor instala jq: brew install jq (macOS) o apt-get install jq (Linux)"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}Error: curl no está instalado${NC}"
        exit 1
    fi
}

# Función para cargar el archivo de configuración
load_test_data() {
    if [ ! -f "$TEST_DATA_FILE" ]; then
        echo -e "${RED}Error: No se encontró el archivo $TEST_DATA_FILE${NC}"
        exit 1
    fi
    
    TEST_DATA=$(cat "$TEST_DATA_FILE")
}

# Función para listar todos los endpoints disponibles
list_endpoints() {
    print_header "ENDPOINTS DISPONIBLES"
    local index=1
    echo "$TEST_DATA" | jq -r 'keys[]' | while read -r endpoint; do
        local path=$(echo "$TEST_DATA" | jq -r ".[\"$endpoint\"].endpoint")
        local test_count=$(echo "$TEST_DATA" | jq ".[\"$endpoint\"].testCases | length")
        echo -e "${YELLOW}[$index]${NC} $endpoint"
        echo "    Endpoint: $path"
        echo "    Tests: $test_count"
        echo ""
        ((index++))
    done
}

# Función para mostrar menú interactivo
show_menu() {
    while true; do
        clear
        print_header "VALIDADOR DE ENDPOINTS - MENÚ PRINCIPAL"
        echo ""
        echo -e "${YELLOW}Selecciona una opción:${NC}"
        echo ""
        echo "  1) Probar un endpoint específico"
        echo "  2) Probar todos los endpoints"
        echo "  3) Ver variables de configuración"
        echo "  4) Cambiar URL base"
        echo "  5) Activar/Desactivar modo verbose"
        echo "  6) Listar endpoints disponibles"
        echo "  0) Salir"
        echo ""
        echo -ne "${BLUE}Opción:${NC} "
        read -r option
        
        case $option in
            1)
                menu_test_specific_endpoint
                ;;
            2)
                clear
                test_all_endpoints
                echo ""
                echo -e "${YELLOW}Presiona Enter para continuar...${NC}"
                read -r
                ;;
            3)
                clear
                show_variables
                echo ""
                echo -e "${YELLOW}Presiona Enter para continuar...${NC}"
                read -r
                ;;
            4)
                menu_change_base_url
                ;;
            5)
                menu_toggle_verbose
                ;;
            6)
                clear
                list_endpoints
                echo ""
                echo -e "${YELLOW}Presiona Enter para continuar...${NC}"
                read -r
                ;;
            0)
                echo ""
                echo -e "${GREEN}¡Hasta luego!${NC}"
                exit 0
                ;;
            *)
                echo ""
                echo -e "${RED}Opción inválida${NC}"
                sleep 1
                ;;
        esac
    done
}

# Función para menú de selección de endpoint específico
menu_test_specific_endpoint() {
    clear
    print_header "SELECCIONAR ENDPOINT"
    echo ""
    
    # Crear array de endpoints
    local endpoints_array=()
    local index=1
    
    while IFS= read -r endpoint; do
        endpoints_array+=("$endpoint")
        local path=$(echo "$TEST_DATA" | jq -r ".[\"$endpoint\"].endpoint")
        local test_count=$(echo "$TEST_DATA" | jq ".[\"$endpoint\"].testCases | length")
        echo -e "${YELLOW}[$index]${NC} $endpoint"
        echo "    Endpoint: $path"
        echo "    Tests: $test_count"
        echo ""
        ((index++))
    done <<< "$(echo "$TEST_DATA" | jq -r 'keys[]')"
    
    echo "  0) Volver al menú principal"
    echo ""
    echo -ne "${BLUE}Selecciona el número del endpoint:${NC} "
    read -r selection
    
    if [ "$selection" = "0" ]; then
        return
    fi
    
    if [ "$selection" -ge 1 ] && [ "$selection" -le "${#endpoints_array[@]}" ]; then
        local selected_endpoint="${endpoints_array[$((selection-1))]}"
        clear
        test_endpoint "$selected_endpoint"
        echo ""
        echo -e "${YELLOW}Presiona Enter para continuar...${NC}"
        read -r
    else
        echo ""
        echo -e "${RED}Selección inválida${NC}"
        sleep 1
    fi
}

# Función para cambiar URL base
menu_change_base_url() {
    clear
    print_header "CAMBIAR URL BASE"
    echo ""
    echo -e "${BLUE}URL actual:${NC} $BASE_URL"
    echo ""
    echo -ne "${YELLOW}Nueva URL (Enter para cancelar):${NC} "
    read -r new_url
    
    if [ -n "$new_url" ]; then
        BASE_URL="$new_url"
        echo ""
        echo -e "${GREEN}✓ URL actualizada a: $BASE_URL${NC}"
    else
        echo ""
        echo -e "${YELLOW}Operación cancelada${NC}"
    fi
    
    sleep 1
}

# Función para activar/desactivar verbose
menu_toggle_verbose() {
    if [ "$VERBOSE" = "true" ]; then
        VERBOSE="false"
        echo ""
        echo -e "${GREEN}✓ Modo verbose desactivado${NC}"
    else
        VERBOSE="true"
        echo ""
        echo -e "${GREEN}✓ Modo verbose activado${NC}"
    fi
    sleep 1
}

# Función para construir query params
build_query_params() {
    local params=$1
    local query=""
    
    if [ "$params" != "null" ] && [ -n "$params" ]; then
        # Excluir el campo 'body' de los query params
        local filtered=$(echo "$params" | jq 'del(.body)')
        
        if [ "$filtered" != "{}" ]; then
            query="?"
            while IFS="=" read -r key value; do
                if [ -n "$key" ] && [ "$key" != "body" ]; then
                    query="${query}${key}=${value}&"
                fi
            done < <(echo "$filtered" | jq -r 'to_entries[] | "\(.key)=\(.value)"')
            query=${query%&}  # Eliminar el último &
        fi
    fi
    
    echo "$query"
}

# Función para ejecutar un test case específico
run_test_case() {
    local endpoint_name=$1
    local test_index=$2
    local test_data=$3
    
    local description=$(echo "$test_data" | jq -r '.description')
    local method=$(echo "$test_data" | jq -r '.method')
    local expected_status=$(echo "$test_data" | jq -r '.expectedStatus')
    local expected_content_type=$(echo "$test_data" | jq -r '.expectedResponseType')
    local endpoint_path=$(echo "$TEST_DATA" | jq -r ".[\"$endpoint_name\"].endpoint")
    local query_params=$(echo "$test_data" | jq -r '.queryParams // {}')
    local body=$(echo "$query_params" | jq -r '.body // null')
    
    echo ""
    print_header "TEST CASE #$test_index: $description"
    echo -e "${BLUE}Endpoint:${NC} $endpoint_name"
    echo -e "${BLUE}Método:${NC} $method"
    echo -e "${BLUE}Path:${NC} $endpoint_path"
    
    # Construir query params (sin body)
    local query=$(build_query_params "$query_params")
    local full_url="${BASE_URL}${endpoint_path}${query}"
    
    echo -e "${BLUE}URL:${NC} $full_url"
    
    # Preparar el comando curl
    local curl_cmd="curl -s -w '\n%{http_code}|%{content_type}' -X $method"
    
    # Agregar body si existe y no es null
    if [ "$body" != "null" ] && [ -n "$body" ]; then
        echo -e "${BLUE}Body:${NC}"
        echo "$body" | jq '.'
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$body'"
    fi
    
    curl_cmd="$curl_cmd '$full_url'"
    
    # Ejecutar la petición
    local response=$(eval $curl_cmd)
    local response_body=$(echo "$response" | sed '$d')
    local response_metadata=$(echo "$response" | tail -n 1)
    local status_code=$(echo "$response_metadata" | cut -d'|' -f1)
    local content_type=$(echo "$response_metadata" | cut -d'|' -f2)
    
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}RESULTADOS:${NC}"
    
    # Validar status code
    if [ "$status_code" = "$expected_status" ]; then
        print_result "PASS" "Status Code: $status_code (esperado: $expected_status)"
    else
        print_result "FAIL" "Status Code: $status_code (esperado: $expected_status)"
    fi
    
    # Validar content type
    if echo "$content_type" | grep -q "$expected_content_type"; then
        print_result "PASS" "Content-Type: $content_type"
    else
        print_result "FAIL" "Content-Type: $content_type (esperado: $expected_content_type)"
    fi
    
    # Mostrar respuesta si verbose está activado o si hubo error
    if [ "$VERBOSE" = "true" ] || [ "$status_code" != "$expected_status" ]; then
        echo ""
        echo -e "${BLUE}Response Body:${NC}"
        if echo "$response_body" | jq '.' >/dev/null 2>&1; then
            echo "$response_body" | jq '.'
        else
            echo "$response_body"
        fi
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Función para probar todos los test cases de un endpoint
test_endpoint() {
    local endpoint_name=$1
    
    if ! echo "$TEST_DATA" | jq -e ".[\"$endpoint_name\"]" >/dev/null 2>&1; then
        echo -e "${RED}Error: Endpoint '$endpoint_name' no encontrado${NC}"
        exit 1
    fi
    
    local test_cases_count=$(echo "$TEST_DATA" | jq ".[\"$endpoint_name\"].testCases | length")
    
    print_header "TESTING: $endpoint_name"
    echo -e "${YELLOW}Total de test cases: $test_cases_count${NC}"
    
    for ((i=0; i<test_cases_count; i++)); do
        local test_case=$(echo "$TEST_DATA" | jq ".[\"$endpoint_name\"].testCases[$i]")
        run_test_case "$endpoint_name" $((i+1)) "$test_case"
        echo ""
    done
}

# Función para probar todos los endpoints
test_all_endpoints() {
    print_header "TESTING ALL ENDPOINTS"
    
    echo "$TEST_DATA" | jq -r 'keys[]' | while read -r endpoint; do
        test_endpoint "$endpoint"
    done
}

# Función para mostrar variables disponibles
show_variables() {
    print_header "VARIABLES DE CONFIGURACIÓN"
    echo -e "${BLUE}BASE_URL:${NC} $BASE_URL"
    echo -e "${BLUE}TEST_DATA_FILE:${NC} $TEST_DATA_FILE"
    echo -e "${BLUE}VERBOSE:${NC} $VERBOSE"
    echo ""
    echo -e "${YELLOW}Para cambiar variables:${NC}"
    echo "  BASE_URL=http://localhost:8080 ./test/endpoint.test.sh"
    echo "  VERBOSE=true ./test/endpoint.test.sh"
}

# Función para mostrar ayuda
show_help() {
    print_header "VALIDADOR DE ENDPOINTS - AYUDA"
    echo "Uso: ./test/endpoint.test.sh [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  (sin argumentos)     Inicia el menú interactivo"
    echo "  menu                Inicia el menú interactivo"
    echo "  list                Lista todos los endpoints disponibles"
    echo "  test <endpoint>     Ejecuta tests para un endpoint específico"
    echo "  test-all            Ejecuta tests para todos los endpoints"
    echo "  vars                Muestra las variables de configuración"
    echo "  help                Muestra esta ayuda"
    echo ""
    echo "Variables de entorno:"
    echo "  BASE_URL            URL base del servidor (default: http://localhost:3000)"
    echo "  VERBOSE             Mostrar respuestas completas (default: false)"
    echo ""
    echo "Ejemplos:"
    echo "  ./test/endpoint.test.sh                              # Menú interactivo"
    echo "  ./test/endpoint.test.sh menu                         # Menú interactivo"
    echo "  ./test/endpoint.test.sh list                         # Listar endpoints"
    echo "  ./test/endpoint.test.sh test products                # Probar productos"
    echo "  ./test/endpoint.test.sh test-all                     # Probar todos"
    echo "  BASE_URL=http://localhost:8080 ./test/endpoint.test.sh menu"
    echo "  VERBOSE=true ./test/endpoint.test.sh test products"
}

# Función principal
main() {
    check_dependencies
    load_test_data
    
    case "${1:-menu}" in
        menu|"")
            show_menu
            ;;
        list)
            list_endpoints
            ;;
        test)
            if [ -z "$2" ]; then
                echo -e "${RED}Error: Debes especificar el nombre del endpoint${NC}"
                echo "Usa: ./test/endpoint.test.sh list para ver los endpoints disponibles"
                exit 1
            fi
            test_endpoint "$2"
            ;;
        test-all)
            test_all_endpoints
            ;;
        vars)
            show_variables
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}Error: Opción no reconocida: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar
main "$@"