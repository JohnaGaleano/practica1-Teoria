# Automatas finitos
 
``` bash
# archivo principal
app.js
```
### Instalar las dependencias del proyecto:
``` bash
cd practica1-teoria
npm install
```

### Ejecutar proyecto:
``` bash
node app.js

## Uso

```javascript


// Ingreso en terminal de un automata para procesar si es AFD o AFND y hacer su proceso en caso de ser AFND a AFD y su respectiva simplificación, en caso de ser AFD solo se realiza su simplificación
node app.js automata -i=1 -a=5 -a=5 -t.1=a -t.1=2 -t.2=a -t.2=3 -t.3=b -t.3=4 -t.4=b -t.4=5 -t.5=b -t.5=5

// Ejemplo de un AFND
node app.js automata -i=1 -a=5 -a=5 -t.1=a -t.1=2 -t.2=a -t.2=3 -t.3=b -t.3=4 -t.4=b -t.4=5 -t.5=b -t.5=5 -t.6='*0' -t.6=2 

// Ingreso en terminal de un automata y comprobar una hilera si es valida o no
node app.js automata -i=1 -a=5 -a=5 -t.1=a -t.1=2 -t.2=a -t.2=3 -t.3=b -t.3=4 -t.4=b -t.4=5 -t.5=b -t.5=5 -p=aabb