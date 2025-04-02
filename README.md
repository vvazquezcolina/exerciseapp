# Exercise Tracker App

Una aplicación web que ayuda a los usuarios a hacer seguimiento de sus ejercicios utilizando visión por computadora. La aplicación puede detectar y contar lagartijas y abdominales, mientras proporciona retroalimentación sobre la calidad de la forma del ejercicio.

## Características

- Calendario interactivo para planificación de ejercicios
- Seguimiento de ejercicios en tiempo real mediante visión por computadora
- Soporte para lagartijas y abdominales
- Evaluación de calidad de la forma del ejercicio
- Conteo automático de repeticiones
- Resúmenes detallados de ejercicios
- Almacenamiento de historial de sesiones
- Diseño responsive para móviles y escritorio
- Feedback automatizado y consejos de mejora

## Stack Tecnológico

- React.js para la interfaz de usuario
- TailwindCSS para estilos
- TensorFlow.js con PoseNet para detección de posturas
- React Webcam para integración de cámara
- React Calendar para selección de fechas
- SessionStorage para persistencia de datos (demo)

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm start
```

3. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Uso

1. Seleccionar una fecha del calendario
2. Hacer clic en "Empezar ejercicio"
3. Elegir entre lagartijas o abdominales
4. Permitir acceso a la cámara cuando se solicite
5. Realizar el ejercicio mientras la aplicación realiza un seguimiento de la forma
6. Ver el resumen del ejercicio al finalizar
7. Consultar el historial de ejercicios a través del calendario

## Módulos implementados

1. **UI de Calendario**
   - Visualización de fechas con ejercicios realizados
   - Acceso a historial de sesiones

2. **Selector de Ejercicios**
   - Interfaz para elegir entre lagartijas y abdominales
   - Asociación con la fecha seleccionada

3. **Visión por Computadora en Tiempo Real**
   - Detección de postura mediante PoseNet
   - Algoritmos para identificar y contar repeticiones
   - Evaluación de calidad basada en ángulos corporales

4. **Almacenamiento por Sesión**
   - Guardado de datos por fecha y tipo de ejercicio
   - Acceso al historial desde el calendario

5. **Visualización de Resultados**
   - Resumen detallado post-entrenamiento
   - Estadísticas de calidad y repeticiones
   - Consejos de mejora personalizados

## Requisitos

- Navegador web moderno con soporte para cámara
- Permisos de cámara habilitados
- JavaScript habilitado

## Futuras mejoras

- Implementación de base de datos real (Firebase/Supabase)
- Autenticación de usuarios
- Más tipos de ejercicios
- Análisis avanzados y estadísticas a lo largo del tiempo
- Sincronización entre dispositivos

## Licencia

MIT 