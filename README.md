Despliegue del proyecto Angular en Plesk
1️⃣ Instalar dependencias
npm install

2️⃣ Configurar el Backend

Abrir el archivo de entorno de producción:

src/environments/environment.prod.ts


Reemplazar la IP del backend y cualquier otra variable necesaria:

export const environment = {
  production: true,
  API_URL: 'http://TU_IP_DEL_BACKEND:3002/api'
};

3️⃣ Generar build de producción
ng build --configuration production


Esto creará la carpeta dist/ con los archivos listos para producción.

4️⃣ Preparar archivos adicionales

Copiar el archivo .htaccess de la raíz del proyecto y pegarlo dentro de:

dist/rcd_epa_front/browser/


Crear dentro de browser la carpeta para archivos:

dist/rcd_epa_front/browser/files


Subir todo el contenido de la carpeta upload dentro de:

dist/rcd_epa_front/browser/files/apprcd/upload

5️⃣ Ajustar permisos

Ejecutar los siguientes comandos para asegurar que los archivos sean accesibles por el servidor:

sudo chmod -R 755 /var/www/rcd_epa_front/dist/rcd_epa_front/browser/files/apprcd/upload
sudo chown -R www-data:www-data /var/www/rcd_epa_front/dist/rcd_epa_front/browser/files/apprcd/upload


Esto asegura que los archivos en /files/apprcd/upload tengan los permisos correctos para lectura y escritura por el servidor web.

Update test